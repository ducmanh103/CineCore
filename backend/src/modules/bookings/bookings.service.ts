import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { TicketStatus, PaymentStatus, SeatType, PaymentMethod } from '@prisma/client';
import { Cron } from '@nestjs/schedule';
import * as crypto from 'crypto';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Tạo đơn đặt vé mới với cơ chế Zero Overbooking
   */
  async createBooking(userId: number, dto: CreateBookingDto) {
    const { showtimeId, seatIds, paymentMethod } = dto;

    if (!seatIds.length) {
      throw new BadRequestException('Vui lòng chọn ít nhất một ghế.');
    }

    // 1. Kiểm tra Suất chiếu
    const showtime = await this.prisma.showtime.findUnique({
      where: { id: showtimeId },
      include: { movie: true, room: { include: { theater: true } } },
    });

    if (!showtime) {
      throw new NotFoundException('Không tìm thấy suất chiếu.');
    }

    if (new Date(showtime.startTime) <= new Date()) {
      throw new BadRequestException('Suất chiếu đã bắt đầu hoặc đã kết thúc.');
    }

    // 2. Khóa ghế phân tán nguyên tử bằng Redis (TTL 15 phút = 900 giây)
    const { success, lockedSeats } = await this.redis.acquireSeatLocks(
      showtimeId,
      seatIds,
      userId,
      900,
    );

    if (!success) {
      throw new ConflictException(
        'Một hoặc nhiều ghế bạn chọn vừa có người khác giữ chỗ. Vui lòng chọn ghế khác.',
      );
    }

    try {
      // 3. Mở PostgreSQL Transaction kiểm tra và tạo vé PENDING
      const bookingResult = await this.prisma.$transaction(async (tx) => {
        // Kiểm tra xem ghế đã có vé BOOKED hoặc PENDING chưa hết hạn trong DB chưa
        const conflictingTickets = await tx.ticket.findMany({
          where: {
            showtimeId,
            seatId: { in: seatIds },
            status: { in: [TicketStatus.BOOKED, TicketStatus.PENDING] },
            OR: [
              { status: TicketStatus.BOOKED },
              { heldUntil: { gt: new Date() } },
            ],
          },
        });

        if (conflictingTickets.length > 0) {
          throw new ConflictException('Ghế đã được đặt hoặc đang có người khác giữ chỗ.');
        }

        // Lấy thông tin loại ghế để tính phụ thu VIP (VIP +15.000đ)
        const seats = await tx.seat.findMany({
          where: { id: { in: seatIds }, roomId: showtime.roomId },
        });

        if (seats.length !== seatIds.length) {
          throw new BadRequestException('Một số ghế không thuộc phòng chiếu này.');
        }

        const bookingCode = `BK${Date.now()}${Math.floor(100 + Math.random() * 900)}`;
        const heldUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 phút
        const basePrice = Number(showtime.price);

        let totalAmount = 0;
        const ticketCreateData = seats.map((seat) => {
          const seatPrice = basePrice + (seat.seatType === SeatType.VIP ? 15000 : 0);
          totalAmount += seatPrice;

          return {
            showtimeId,
            seatId: seat.id,
            userId,
            bookingCode,
            price: seatPrice,
            status: TicketStatus.PENDING,
            heldUntil,
          };
        });

        // Tạo bản ghi Payment
        const payment = await tx.payment.create({
          data: {
            userId,
            bookingCode,
            amount: totalAmount,
            method: paymentMethod,
            status: PaymentStatus.PENDING,
          },
        });

        // Tạo các vé PENDING
        const tickets = await Promise.all(
          ticketCreateData.map((t) =>
            tx.ticket.create({
              data: {
                ...t,
                paymentId: payment.id,
              },
              include: { seat: true },
            }),
          ),
        );

        return {
          bookingCode,
          totalAmount,
          heldUntil,
          paymentId: payment.id,
          tickets,
        };
      });

      return {
        bookingCode: bookingResult.bookingCode,
        totalAmount: bookingResult.totalAmount,
        heldUntil: bookingResult.heldUntil,
        paymentId: bookingResult.paymentId,
        tickets: bookingResult.tickets,
        movieTitle: showtime.movie.title,
        theaterName: showtime.room.theater.name,
        roomName: showtime.room.name,
        startTime: showtime.startTime,
      };
    } catch (err) {
      // Nếu có lỗi trong Transaction DB, rollback Redis locks
      await this.redis.releaseSeatLocks(showtimeId, seatIds);
      throw err;
    }
  }

  /**
   * Lấy danh sách vé của người dùng hiện tại
   */
  async getUserTickets(userId: number) {
    return this.prisma.ticket.findMany({
      where: { userId },
      include: {
        seat: true,
        showtime: {
          include: {
            movie: true,
            room: { include: { theater: true } },
          },
        },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Cron Job chạy mỗi 2 phút: Tự động hủy các vé PENDING quá hạn 15 phút
   */
  @Cron('*/2 * * * *')
  async cleanExpiredPendingTickets() {
    if (!this.prisma.isConnected()) return;

    try {
      const now = new Date();
      const expiredTickets = await this.prisma.ticket.findMany({
        where: {
          status: TicketStatus.PENDING,
          heldUntil: { lte: now },
        },
        select: { id: true, showtimeId: true, seatId: true, paymentId: true },
      });

      if (!expiredTickets.length) return;

      this.logger.log(`Tìm thấy ${expiredTickets.length} vé PENDING quá hạn cần giải phóng.`);

      const ticketIds = expiredTickets.map((t) => t.id);
      const paymentIds = Array.from(
        new Set(expiredTickets.map((t) => t.paymentId).filter(Boolean)),
      ) as number[];

      await this.prisma.$transaction([
        this.prisma.ticket.updateMany({
          where: { id: { in: ticketIds } },
          data: { status: TicketStatus.EXPIRED },
        }),
        this.prisma.payment.updateMany({
          where: { id: { in: paymentIds }, status: PaymentStatus.PENDING },
          data: { status: PaymentStatus.FAILED },
        }),
      ]);

      // Giải phóng khóa trên Redis
      for (const t of expiredTickets) {
        await this.redis.releaseSeatLocks(t.showtimeId, [t.seatId]);
      }

      this.logger.log(`Đã giải phóng thành công ${expiredTickets.length} vé hết hạn.`);
    } catch (err) {
      this.logger.error(`Lỗi khi dọn dẹp vé PENDING hết hạn: ${err.message}`);
    }
  }
}


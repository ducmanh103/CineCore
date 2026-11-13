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
  private readonly fallbackTickets: any[] = [];
  private readonly fallbackPayments: any[] = [];

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  getFallbackPayment(bookingCode: string) {
    return this.fallbackPayments.find((p) => p.bookingCode === bookingCode) || null;
  }

  completeFallbackPayment(bookingCode: string, transactionId?: string, responseCode = '00') {
    const payment = this.getFallbackPayment(bookingCode);
    if (payment) {
      payment.status = PaymentStatus.COMPLETED;
      payment.transactionId = transactionId || `TXN${Date.now()}`;
      payment.vnpResponseCode = responseCode;
      payment.paidAt = new Date();
    }
    const tickets = this.fallbackTickets.filter((t) => t.bookingCode === bookingCode);
    for (const t of tickets) {
      t.status = TicketStatus.BOOKED;
      t.heldUntil = null;
    }
    return { payment, tickets };
  }

  failFallbackPayment(bookingCode: string, responseCode = '24') {
    const payment = this.getFallbackPayment(bookingCode);
    if (payment) {
      payment.status = PaymentStatus.FAILED;
      payment.vnpResponseCode = responseCode;
    }
    const tickets = this.fallbackTickets.filter((t) => t.bookingCode === bookingCode);
    for (const t of tickets) {
      t.status = TicketStatus.CANCELLED;
      t.heldUntil = null;
    }
    return { payment, tickets };
  }

  /**
   * Tạo đơn đặt vé mới với cơ chế Zero Overbooking
   */
  async createBooking(userId: number, dto: CreateBookingDto) {
    const { showtimeId, seatIds, paymentMethod } = dto;
    const uniqueSeatIds = Array.from(new Set(seatIds.map(Number)));

    if (!uniqueSeatIds.length) {
      throw new BadRequestException('Vui lòng chọn ít nhất một ghế.');
    }

    if (uniqueSeatIds.length > 8) {
      throw new BadRequestException('Chỉ được đặt tối đa 8 ghế trong một giao dịch.');
    }

    // 1. Khóa ghế phân tán nguyên tử bằng Redis (TTL 15 phút = 900 giây)
    const { success } = await this.redis.acquireSeatLocks(
      showtimeId,
      uniqueSeatIds,
      userId,
      900,
    );

    if (!success) {
      throw new ConflictException(
        'Một hoặc nhiều ghế bạn chọn vừa có người khác giữ chỗ. Vui lòng chọn ghế khác.',
      );
    }

    // Nếu PostgreSQL chưa kết nối -> xử lý đặt vé bằng Fallback In-Memory
    if (!this.prisma.isConnected()) {
      const now = new Date();
      const conflict = this.fallbackTickets.find(
        (t) =>
          t.showtimeId === showtimeId &&
          uniqueSeatIds.includes(t.seatId) &&
          (t.status === TicketStatus.BOOKED ||
            (t.status === TicketStatus.PENDING && t.heldUntil && new Date(t.heldUntil) > now)),
      );

      if (conflict) {
        await this.redis.releaseSeatLocks(showtimeId, uniqueSeatIds);
        throw new ConflictException('Ghế đã được đặt hoặc đang có người khác giữ chỗ.');
      }

      const bookingCode = `BK${Date.now()}${Math.floor(100 + Math.random() * 900)}`;
      const heldUntil = new Date(Date.now() + 15 * 60 * 1000);
      const basePrice = 85000;
      const isCash = paymentMethod === PaymentMethod.CASH;

      let totalAmount = 0;
      const createdTickets: any[] = [];
      const paymentId = this.fallbackPayments.length + 1;

      for (const seatId of uniqueSeatIds) {
        const rowIdx = Math.floor((seatId - 1) / 8);
        const seatRow = ['A', 'B', 'C', 'D', 'E', 'F'][rowIdx] || 'A';
        const seatNumber = ((seatId - 1) % 8) + 1;
        const isVip = seatRow === 'E' || seatRow === 'F';
        const seatPrice = basePrice + (isVip ? 15000 : 0);
        totalAmount += seatPrice;

        const ticket = {
          id: this.fallbackTickets.length + 1,
          showtimeId,
          seatId,
          userId,
          paymentId,
          bookingCode,
          price: seatPrice,
          status: isCash ? TicketStatus.BOOKED : TicketStatus.PENDING,
          heldUntil: isCash ? null : heldUntil,
          createdAt: new Date(),
          seat: {
            id: seatId,
            roomId: 1,
            seatRow,
            seatNumber,
            seatType: isVip ? SeatType.VIP : SeatType.STANDARD,
          },
          showtime: {
            id: showtimeId,
            startTime: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
            endTime: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
            price: basePrice,
            movie: { id: 1, title: 'Kung Fu Panda 4', posterUrl: '/img/movies/kungfupanda4.jpg' },
            room: {
              id: 1,
              name: 'Phòng 1 (Standard)',
              screenType: '2D Digital',
              theater: { id: 1, name: 'CineCore Nguyễn Huệ' },
            },
          },
        };
        this.fallbackTickets.push(ticket);
        createdTickets.push(ticket);
      }

      this.fallbackPayments.push({
        id: paymentId,
        userId,
        bookingCode,
        amount: totalAmount,
        method: paymentMethod,
        status: isCash ? PaymentStatus.COMPLETED : PaymentStatus.PENDING,
        paidAt: isCash ? new Date() : null,
        tickets: createdTickets,
        createdAt: new Date(),
      });

      return {
        bookingCode,
        totalAmount,
        heldUntil: isCash ? null : heldUntil,
        paymentId,
        tickets: createdTickets,
        movieTitle: 'Kung Fu Panda 4',
        theaterName: 'CineCore Nguyễn Huệ',
        roomName: 'Phòng 1 (Standard)',
        startTime: createdTickets[0].showtime.startTime,
      };
    }

    try {
      // 2. Kiểm tra Suất chiếu trên PostgreSQL
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

      // 3. Mở PostgreSQL Transaction kiểm tra và tạo vé
      const bookingResult = await this.prisma.$transaction(async (tx) => {
        // Kiểm tra xem ghế đã có vé BOOKED hoặc PENDING chưa hết hạn trong DB chưa
        const conflictingTickets = await tx.ticket.findMany({
          where: {
            showtimeId,
            seatId: { in: uniqueSeatIds },
            OR: [
              { status: TicketStatus.BOOKED },
              { status: TicketStatus.PENDING, heldUntil: { gt: new Date() } },
            ],
          },
        });

        if (conflictingTickets.length > 0) {
          throw new ConflictException('Ghế đã được đặt hoặc đang có người khác giữ chỗ.');
        }

        // Lấy thông tin loại ghế để tính phụ thu VIP (VIP +15.000đ)
        const seats = await tx.seat.findMany({
          where: { id: { in: uniqueSeatIds }, roomId: showtime.roomId },
        });

        if (seats.length !== uniqueSeatIds.length) {
          throw new BadRequestException('Một số ghế không thuộc phòng chiếu này.');
        }

        const bookingCode = `BK${Date.now()}${Math.floor(100 + Math.random() * 900)}`;
        const heldUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 phút
        const basePrice = Number(showtime.price);
        const isCash = paymentMethod === PaymentMethod.CASH;

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
            status: isCash ? TicketStatus.BOOKED : TicketStatus.PENDING,
            heldUntil: isCash ? null : heldUntil,
          };
        });

        // Tạo bản ghi Payment
        const payment = await tx.payment.create({
          data: {
            userId,
            bookingCode,
            amount: totalAmount,
            method: paymentMethod,
            status: isCash ? PaymentStatus.COMPLETED : PaymentStatus.PENDING,
            paidAt: isCash ? new Date() : null,
          },
        });

        // Tạo các vé
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
          heldUntil: isCash ? null : heldUntil,
          paymentId: payment.id,
          tickets,
        };
      });

      // Nếu thanh toán tiền mặt đã BOOKED ngay, giải phóng lock tạm trên Redis
      if (paymentMethod === PaymentMethod.CASH) {
        await this.redis.releaseSeatLocks(showtimeId, uniqueSeatIds);
      }

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
      await this.redis.releaseSeatLocks(showtimeId, uniqueSeatIds);
      throw err;
    }
  }

  /**
   * Lấy danh sách vé của người dùng hiện tại
   */
  async getUserTickets(userId: number) {
    if (this.prisma.isConnected()) {
      try {
        return await this.prisma.ticket.findMany({
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
      } catch {
        // Fallback to in-memory
      }
    }
    return this.fallbackTickets
      .filter((t) => t.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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


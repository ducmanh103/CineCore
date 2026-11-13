import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { TicketStatus } from '@prisma/client';
import { CreateShowtimeDto } from './dto/showtime.dto';
import { FALLBACK_SHOWTIMES } from '../../common/constants/fallback-catalogue.constant';

@Injectable()
export class ShowtimesService {
  private readonly logger = new Logger(ShowtimesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async findAll(params: {
    movieId?: number;
    theaterId?: number;
    date?: string; // YYYY-MM-DD
  }) {
    if (this.prisma.isConnected()) {
      try {
        const { movieId, theaterId, date } = params;
        const where: any = {};

        if (movieId) where.movieId = movieId;
        if (theaterId) where.room = { theaterId };

        if (date) {
          const startOfDay = new Date(`${date}T00:00:00.000+07:00`);
          const endOfDay = new Date(`${date}T23:59:59.999+07:00`);
          where.startTime = { gte: startOfDay, lte: endOfDay };
        } else {
          where.startTime = { gte: new Date() };
        }

        const showtimes = await this.prisma.showtime.findMany({
          where,
          include: {
            movie: {
              select: { id: true, title: true, posterUrl: true, duration: true, ageRating: true },
            },
            room: {
              include: { theater: true },
            },
          },
          orderBy: { startTime: 'asc' },
        });

        if (showtimes.length > 0) return showtimes;
      } catch (err: any) {
        this.logger.warn(`Lỗi truy vấn DB: ${err.message}`);
      }
    }

    return FALLBACK_SHOWTIMES as any;
  }

  async getShowtimeWithSeats(showtimeId: number, currentUserId?: number) {
    if (this.prisma.isConnected()) {
      try {
        const showtime = await this.prisma.showtime.findUnique({
          where: { id: showtimeId },
          include: {
            movie: true,
            room: {
              include: {
                theater: true,
                seats: {
                  orderBy: [{ seatRow: 'asc' }, { seatNumber: 'asc' }],
                },
              },
            },
          },
        });

        if (showtime && showtime.room?.seats?.length > 0) {
          const activeTickets = await this.prisma.ticket.findMany({
            where: {
              showtimeId,
              OR: [
                { status: TicketStatus.BOOKED },
                { status: TicketStatus.PENDING, heldUntil: { gt: new Date() } },
              ],
            },
          });

          const ticketMap = new Map<number, { status: TicketStatus; userId: number }>();
          activeTickets.forEach((t) => {
            ticketMap.set(t.seatId, { status: t.status, userId: t.userId });
          });

          const seatsWithStatus = await Promise.all(
            showtime.room.seats.map(async (seat) => {
              const ticket = ticketMap.get(seat.id);
              let seatStatus = 'AVAILABLE';

              if (ticket) {
                if (ticket.status === TicketStatus.BOOKED) {
                  seatStatus = 'BOOKED';
                } else if (ticket.status === TicketStatus.PENDING) {
                  seatStatus =
                    currentUserId && ticket.userId === currentUserId ? 'MY_PENDING' : 'PENDING';
                }
              } else {
                const lockedBy = await this.redis.getSeatLockOwner(showtimeId, seat.id);
                if (lockedBy) {
                  seatStatus =
                    currentUserId && lockedBy === currentUserId.toString()
                      ? 'MY_PENDING'
                      : 'PENDING';
                }
              }

              return {
                ...seat,
                status: seatStatus,
              };
            }),
          );

          return {
            showtime: {
              id: showtime.id,
              startTime: showtime.startTime,
              endTime: showtime.endTime,
              price: showtime.price,
              movie: showtime.movie,
              theater: showtime.room.theater,
              room: {
                id: showtime.room.id,
                name: showtime.room.name,
                screenType: showtime.room.screenType,
                theater: showtime.room.theater,
              },
            },
            seats: seatsWithStatus,
          };
        }
      } catch (err: any) {
        this.logger.warn(`Lỗi khi lấy sơ đồ ghế từ DB: ${err.message}. Sử dụng phòng chiếu mẫu.`);
      }
    }

    // Phòng chiếu mẫu 48 ghế (A-F, 1-8, hàng E & F là VIP)
    const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
    const sampleSeats: any[] = [];
    let idCounter = 1;
    for (const r of rows) {
      for (let num = 1; num <= 8; num++) {
        const isVip = r === 'E' || r === 'F';
        sampleSeats.push({
          id: idCounter++,
          roomId: 1,
          seatRow: r,
          seatNumber: num,
          seatType: isVip ? 'VIP' : 'STANDARD',
          status: 'AVAILABLE',
        });
      }
    }

    const st = FALLBACK_SHOWTIMES.find((s) => s.id === showtimeId) || FALLBACK_SHOWTIMES[0];
    return {
      showtime: {
        id: st.id,
        startTime: st.startTime,
        endTime: st.endTime,
        price: st.price,
        movie: st.movie,
        theater: st.room.theater,
        room: {
          id: st.room.id,
          name: st.room.name,
          screenType: st.room.screenType,
          theater: st.room.theater,
        },
      },
      seats: sampleSeats,
    };
  }

  /**
   * Tạo suất chiếu mới có kiểm tra chống trùng giờ phòng chiếu
   */
  async createShowtime(dto: CreateShowtimeDto) {
    const movieId = Number(dto.movieId);
    const roomId = Number(dto.roomId);
    const price = Number(dto.price) || 95000;
    const start = new Date(dto.startTime);

    if (isNaN(start.getTime())) {
      throw new BadRequestException('Thời gian bắt đầu chiếu không hợp lệ.');
    }

    if (this.prisma.isConnected()) {
      const [movie, room] = await Promise.all([
        this.prisma.movie.findUnique({ where: { id: movieId } }),
        this.prisma.room.findUnique({ where: { id: roomId }, include: { theater: true } }),
      ]);

      if (!movie) throw new NotFoundException('Không tìm thấy phim.');
      if (!room) throw new NotFoundException('Không tìm thấy phòng chiếu.');

      // Cộng thêm 15 phút dọn vệ sinh phòng giữa các ca chiếu
      const end = new Date(start.getTime() + (movie.duration + 15) * 60 * 1000);

      // Kiểm tra trùng khung giờ tại cùng phòng chiếu
      const overlapping = await this.prisma.showtime.findFirst({
        where: {
          roomId,
          startTime: { lt: end },
          endTime: { gt: start },
        },
        include: { movie: true },
      });

      if (overlapping) {
        throw new ConflictException(
          `Phòng ${room.name} đã có lịch chiếu phim "${overlapping.movie.title}" từ ${overlapping.startTime.toLocaleTimeString('vi-VN')} đến ${overlapping.endTime.toLocaleTimeString('vi-VN')}.`,
        );
      }

      return this.prisma.showtime.create({
        data: {
          movieId,
          roomId,
          startTime: start,
          endTime: end,
          price,
        },
        include: {
          movie: { select: { id: true, title: true, posterUrl: true, duration: true, ageRating: true } },
          room: { include: { theater: true } },
        },
      });
    }

    const end = new Date(start.getTime() + 120 * 60 * 1000);
    const newShowtime: any = {
      id: FALLBACK_SHOWTIMES.length + 1,
      movieId,
      roomId,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      price,
      movie: FALLBACK_SHOWTIMES[0].movie,
      room: FALLBACK_SHOWTIMES[0].room,
    };
    FALLBACK_SHOWTIMES.unshift(newShowtime);
    return newShowtime;
  }

  async deleteShowtime(id: number) {
    if (this.prisma.isConnected()) {
      const existing = await this.prisma.showtime.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException('Không tìm thấy suất chiếu.');

      const ticketCount = await this.prisma.ticket.count({
        where: { showtimeId: id, status: TicketStatus.BOOKED },
      });
      if (ticketCount > 0) {
        throw new BadRequestException('Không thể xóa suất chiếu đã có khách hàng đặt vé.');
      }

      await this.prisma.ticket.deleteMany({ where: { showtimeId: id } });
      await this.prisma.showtime.delete({ where: { id } });
      return { message: 'Đã xóa suất chiếu thành công.' };
    }

    const idx = FALLBACK_SHOWTIMES.findIndex((s) => s.id === id);
    if (idx !== -1) FALLBACK_SHOWTIMES.splice(idx, 1);
    return { message: 'Đã xóa suất chiếu thành công.' };
  }
}

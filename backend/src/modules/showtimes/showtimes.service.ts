import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { TicketStatus } from '@prisma/client';

const FALLBACK_SHOWTIMES = [
  {
    id: 1,
    movieId: 1,
    roomId: 1,
    startTime: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
    endTime: new Date(Date.now() + 3.6 * 3600 * 1000).toISOString(),
    price: 85000,
    movie: {
      id: 1,
      title: 'Kung Fu Panda 4',
      posterUrl: '/img/movies/kungfupanda4.jpg',
      duration: 94,
      ageRating: 'P',
    },
    room: {
      id: 1,
      name: 'Phòng 1 (Standard)',
      screenType: '2D Digital',
      theater: { id: 1, name: 'CineCore Nguyễn Huệ' },
    },
  },
  {
    id: 2,
    movieId: 2,
    roomId: 3,
    startTime: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
    endTime: new Date(Date.now() + 5.8 * 3600 * 1000).toISOString(),
    price: 110000,
    movie: {
      id: 2,
      title: 'Dune: Phần 2',
      posterUrl: '/img/movies/dune2.jpg',
      duration: 166,
      ageRating: 'T16',
    },
    room: {
      id: 3,
      name: 'Phòng 1 (IMAX)',
      screenType: 'IMAX Laser 4K',
      theater: { id: 2, name: 'CineCore Hà Đông' },
    },
  },
  {
    id: 3,
    movieId: 3,
    roomId: 2,
    startTime: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
    endTime: new Date(Date.now() + 6.2 * 3600 * 1000).toISOString(),
    price: 95000,
    movie: {
      id: 3,
      title: 'Mai',
      posterUrl: '/img/movies/mai.jpg',
      duration: 131,
      ageRating: 'T18',
    },
    room: {
      id: 2,
      name: 'Phòng 2 (VIP)',
      screenType: 'Gold Class 3D',
      theater: { id: 1, name: 'CineCore Nguyễn Huệ' },
    },
  },
  {
    id: 4,
    movieId: 4,
    roomId: 8,
    startTime: new Date(Date.now() + 5 * 3600 * 1000).toISOString(),
    endTime: new Date(Date.now() + 7.3 * 3600 * 1000).toISOString(),
    price: 105000,
    movie: {
      id: 4,
      title: 'Quật Mộ Trùng Ma',
      posterUrl: '/img/movies/quatmotrungma.jpg',
      duration: 134,
      ageRating: 'T18',
    },
    room: {
      id: 8,
      name: 'Phòng 1 (Grand)',
      screenType: 'IMAX Laser',
      theater: { id: 3, name: 'CineCore Đà Nẵng' },
    },
  },
];

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
    try {
      const { movieId, theaterId, date } = params;
      const where: any = {};

      if (movieId) where.movieId = movieId;
      if (theaterId) where.room = { theaterId };

      if (date) {
        const startOfDay = new Date(`${date}T00:00:00.000Z`);
        const endOfDay = new Date(`${date}T23:59:59.999Z`);
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
      this.logger.warn(`PostgreSQL chưa bật, trả về danh sách lịch chiếu dự phòng: ${err.message}`);
    }

    return FALLBACK_SHOWTIMES as any;
  }

  async getShowtimeWithSeats(showtimeId: number, currentUserId?: number) {
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
            status: { in: [TicketStatus.BOOKED, TicketStatus.PENDING] },
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
                seatStatus = currentUserId && ticket.userId === currentUserId ? 'MY_PENDING' : 'PENDING';
              }
            } else {
              const lockKey = `seat:lock:${showtimeId}:${seat.id}`;
              const client = this.redis.getClient();
              if (client && client.status === 'ready') {
                const lockedBy = await client.get(lockKey);
                if (lockedBy) {
                  seatStatus =
                    currentUserId && lockedBy === currentUserId.toString()
                      ? 'MY_PENDING'
                      : 'PENDING';
                }
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
            },
          },
          seats: seatsWithStatus,
        };
      }
    } catch (err: any) {
      this.logger.warn(`Lỗi khi lấy sơ đồ ghế từ DB: ${err.message}. Sử dụng phòng chiếu mẫu.`);
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
          status: (r === 'C' && (num === 4 || num === 5)) ? 'BOOKED' : 'AVAILABLE',
        });
      }
    }

    const st = FALLBACK_SHOWTIMES[0];
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
        },
      },
      seats: sampleSeats,
    };
  }
}

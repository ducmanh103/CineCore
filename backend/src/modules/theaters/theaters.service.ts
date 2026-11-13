import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FALLBACK_THEATERS } from '../../common/constants/fallback-catalogue.constant';

@Injectable()
export class TheatersService {
  private readonly logger = new Logger(TheatersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    if (this.prisma.isConnected()) {
      try {
        const theaters = await this.prisma.theater.findMany({
          include: {
            rooms: {
              include: {
                _count: {
                  select: { seats: true },
                },
              },
            },
          },
          orderBy: { id: 'asc' },
        });

        if (theaters.length > 0) return theaters;
      } catch (err: any) {
        this.logger.warn(`PostgreSQL chưa bật, trả về danh sách rạp dự phòng: ${err.message}`);
      }
    }

    return FALLBACK_THEATERS;
  }

  async findById(id: number) {
    if (this.prisma.isConnected()) {
      try {
        const theater = await this.prisma.theater.findUnique({
          where: { id },
          include: {
            rooms: {
              include: {
                seats: {
                  orderBy: [{ seatRow: 'asc' }, { seatNumber: 'asc' }],
                },
              },
            },
          },
        });

        if (theater) return theater;
      } catch {}
    }

    return FALLBACK_THEATERS.find((t) => t.id === id) || FALLBACK_THEATERS[0];
  }
}

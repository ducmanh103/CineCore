import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const FALLBACK_THEATERS = [
  {
    id: 1,
    name: 'CineCore Nguyễn Huệ',
    slug: 'cinecore-nguyen-hue',
    address: '123 Nguyễn Huệ, Quận 1',
    city: 'TP. Hồ Chí Minh',
    phone: '028 3822 1234',
    rooms: [
      { id: 1, name: 'Phòng 1 (Standard)', screenType: '2D Digital', totalSeats: 30, _count: { seats: 30 } },
      { id: 2, name: 'Phòng 2 (VIP)', screenType: 'Gold Class 3D', totalSeats: 20, _count: { seats: 20 } },
    ],
  },
  {
    id: 2,
    name: 'CineCore Hà Đông',
    slug: 'cinecore-ha-dong',
    address: '110 Trần Phú, Hà Đông',
    city: 'Hà Nội',
    phone: '024 3355 6789',
    rooms: [
      { id: 3, name: 'Phòng 1 (IMAX)', screenType: 'IMAX Laser 4K', totalSeats: 40, _count: { seats: 40 } },
      { id: 4, name: 'Phòng 2', screenType: '2D Digital', totalSeats: 40, _count: { seats: 40 } },
      { id: 5, name: 'Phòng 3', screenType: '2D Digital', totalSeats: 30, _count: { seats: 30 } },
      { id: 6, name: 'Phòng 4', screenType: '3D Digital', totalSeats: 30, _count: { seats: 30 } },
      { id: 7, name: 'Phòng 5 (Super)', screenType: '4DX Laser', totalSeats: 50, _count: { seats: 50 } },
    ],
  },
  {
    id: 3,
    name: 'CineCore Đà Nẵng',
    slug: 'cinecore-da-nang',
    address: '910A Ngô Quyền, Sơn Trà',
    city: 'Đà Nẵng',
    phone: '0236 3999 888',
    rooms: [
      { id: 8, name: 'Phòng 1 (Grand)', screenType: 'IMAX Laser', totalSeats: 50, _count: { seats: 50 } },
      { id: 9, name: 'Phòng 2', screenType: '2D Digital', totalSeats: 40, _count: { seats: 40 } },
      { id: 10, name: 'Phòng 3', screenType: '3D Digital', totalSeats: 40, _count: { seats: 40 } },
      { id: 11, name: 'Phòng 4', screenType: '2D Digital', totalSeats: 30, _count: { seats: 30 } },
      { id: 12, name: 'Phòng 5', screenType: '2D Digital', totalSeats: 30, _count: { seats: 30 } },
      { id: 13, name: 'Phòng 6', screenType: 'Gold Class', totalSeats: 30, _count: { seats: 30 } },
    ],
  },
  {
    id: 4,
    name: 'CineCore Cần Thơ',
    slug: 'cinecore-can-tho',
    address: 'Đại lộ Hoà Bình, Ninh Kiều',
    city: 'Cần Thơ',
    phone: '0292 3888 777',
    rooms: [
      { id: 14, name: 'Phòng 1', screenType: '2D Digital', totalSeats: 40, _count: { seats: 40 } },
      { id: 15, name: 'Phòng 2', screenType: '3D Digital', totalSeats: 40, _count: { seats: 40 } },
      { id: 16, name: 'Phòng 3', screenType: '2D Digital', totalSeats: 30, _count: { seats: 30 } },
      { id: 17, name: 'Phòng 4', screenType: '2D Digital', totalSeats: 30, _count: { seats: 30 } },
      { id: 18, name: 'Phòng 5 (VIP)', screenType: 'VIP Lounge', totalSeats: 20, _count: { seats: 20 } },
    ],
  },
  {
    id: 5,
    name: 'CineCore Huế',
    slug: 'cinecore-hue',
    address: 'Vincom Plaza, Phú Nhuận',
    city: 'Huế',
    phone: '0234 3777 666',
    rooms: [
      { id: 19, name: 'Phòng 1 (Premiere)', screenType: 'IMAX Laser 4K', totalSeats: 50, _count: { seats: 50 } },
      { id: 20, name: 'Phòng 2', screenType: '2D Digital', totalSeats: 40, _count: { seats: 40 } },
      { id: 21, name: 'Phòng 3', screenType: '2D Digital', totalSeats: 40, _count: { seats: 40 } },
      { id: 22, name: 'Phòng 4', screenType: '3D Digital', totalSeats: 30, _count: { seats: 30 } },
      { id: 23, name: 'Phòng 5', screenType: '2D Digital', totalSeats: 30, _count: { seats: 30 } },
      { id: 24, name: 'Phòng 6', screenType: '2D Digital', totalSeats: 30, _count: { seats: 30 } },
      { id: 25, name: 'Phòng 7 (VIP)', screenType: 'Gold Class', totalSeats: 20, _count: { seats: 20 } },
    ],
  },
];

@Injectable()
export class TheatersService {
  private readonly logger = new Logger(TheatersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
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

    return FALLBACK_THEATERS;
  }

  async findById(id: number) {
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

    const found = FALLBACK_THEATERS.find((t) => t.id === id) || FALLBACK_THEATERS[0];
    return found;
  }
}

import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { MovieStatus } from '@prisma/client';
import { CreateMovieDto, UpdateMovieDto } from './dto/movie.dto';
import {
  FALLBACK_GENRES,
  FALLBACK_MOVIES,
  FALLBACK_THEATERS,
} from '../../common/constants/fallback-catalogue.constant';

@Injectable()
export class MoviesService {
  private readonly logger = new Logger(MoviesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async findAll(params: {
    status?: MovieStatus;
    search?: string;
    genreId?: number;
  }) {
    const { status, search, genreId } = params;
    try {
      const where: any = {};
      if (status) where.status = status;
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { director: { contains: search, mode: 'insensitive' } },
        ];
      }
      if (genreId) {
        where.genres = { some: { genreId } };
      }

      if (this.prisma.isConnected()) {
        const movies = await this.prisma.movie.findMany({
          where,
          include: {
            genres: { include: { genre: true } },
          },
          orderBy: { releaseDate: 'desc' },
        });

        if (movies && movies.length > 0) return movies;
      }
    } catch (err: any) {
      this.logger.warn(`PostgreSQL chưa sẵn sàng, trả về danh sách phim mẫu dự phòng: ${err.message}`);
    }

    return this.filterFallbackMovies(status, search, genreId);
  }

  private filterFallbackMovies(status?: MovieStatus, search?: string, genreId?: number) {
    let filtered = [...FALLBACK_MOVIES];
    if (status) filtered = filtered.filter((m) => m.status === status);
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          (m.director && m.director.toLowerCase().includes(q)),
      );
    }
    if (genreId) {
      filtered = filtered.filter((m) => m.genres.some((g) => g.genre.id === genreId));
    }
    return filtered;
  }

  async getLandingData() {
    try {
      const cacheKey = 'cache:home:landing';
      const cached = await this.redis.getCache<any>(cacheKey);
      if (cached) return cached;

      if (this.prisma.isConnected()) {
        const [nowShowing, comingSoon, theaters, genres] = await Promise.all([
          this.prisma.movie.findMany({
            where: { status: MovieStatus.NOW_SHOWING },
            include: { genres: { include: { genre: true } } },
            take: 8,
          }),
          this.prisma.movie.findMany({
            where: { status: MovieStatus.COMING_SOON },
            include: { genres: { include: { genre: true } } },
            take: 6,
          }),
          this.prisma.theater.findMany({
            take: 5,
            include: { rooms: true },
          }),
          this.prisma.genre.findMany(),
        ]);

        if (nowShowing.length > 0) {
          const result = {
            heroMovies: nowShowing.slice(0, 4),
            nowShowing,
            comingSoon,
            theaters,
            genres,
          };
          await this.redis.setCache(cacheKey, result, 120);
          return result;
        }
      }
    } catch (err: any) {
      this.logger.warn(`Lỗi khi lấy dữ liệu landing từ DB: ${err.message}. Sử dụng dữ liệu mẫu dự phòng.`);
    }

    const nowShowingFallback = FALLBACK_MOVIES.filter((m) => m.status === 'NOW_SHOWING');
    const comingSoonFallback = FALLBACK_MOVIES.filter((m) => m.status === 'COMING_SOON');

    return {
      heroMovies: nowShowingFallback.slice(0, 4),
      nowShowing: nowShowingFallback,
      comingSoon: comingSoonFallback,
      theaters: FALLBACK_THEATERS,
      genres: FALLBACK_GENRES,
    };
  }

  async findById(id: number) {
    if (this.prisma.isConnected()) {
      try {
        const movie = await this.prisma.movie.findUnique({
          where: { id },
          include: {
            genres: { include: { genre: true } },
            showtimes: {
              where: { startTime: { gte: new Date() } },
              include: { room: { include: { theater: true } } },
              orderBy: { startTime: 'asc' },
              take: 10,
            },
          },
        });

        if (movie) return movie;
      } catch (err: any) {
        this.logger.warn(`Lỗi khi tìm phim ID ${id} từ DB: ${err.message}`);
      }
    }

    const fallback = FALLBACK_MOVIES.find((m) => m.id === id) || FALLBACK_MOVIES[0];
    return {
      ...fallback,
      showtimes: [
        {
          id: 1,
          movieId: fallback.id,
          roomId: 1,
          startTime: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
          endTime: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
          price: 105000,
          room: {
            id: 1,
            name: 'Cinema 01',
            screenType: 'IMAX Laser 4K',
            theater: FALLBACK_THEATERS[0],
          },
        },
      ],
    };
  }

  private slugify(text: string): string {
    return text
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async createMovie(dto: CreateMovieDto) {
    const slug = `${this.slugify(dto.title || 'movie')}-${Date.now().toString().slice(-4)}`;
    if (this.prisma.isConnected()) {
      const movie = await this.prisma.movie.create({
        data: {
          title: dto.title,
          slug,
          description: dto.description || '',
          duration: Number(dto.duration) || 120,
          releaseDate: dto.releaseDate ? new Date(dto.releaseDate) : new Date(),
          trailerUrl: dto.trailerUrl || null,
          posterUrl: dto.posterUrl || null,
          bannerUrl: dto.bannerUrl || null,
          ageRating: dto.ageRating || 'P',
          director: dto.director || null,
          cast: dto.cast || null,
          status: (dto.status as MovieStatus) || MovieStatus.NOW_SHOWING,
        },
        include: { genres: { include: { genre: true } } },
      });
      await this.redis.delCacheByPattern('cache:home:*');
      return movie;
    }

    const newMovie: any = {
      id: FALLBACK_MOVIES.length + 1,
      title: dto.title,
      slug,
      description: dto.description || '',
      duration: Number(dto.duration) || 120,
      releaseDate: dto.releaseDate || new Date().toISOString(),
      trailerUrl: dto.trailerUrl || '',
      posterUrl: dto.posterUrl || '/img/movies/kungfupanda4.jpg',
      bannerUrl: dto.bannerUrl || '/img/movies/kungfupanda4-banner.jpg',
      ageRating: dto.ageRating || 'P',
      director: dto.director || '',
      cast: dto.cast || '',
      status: dto.status || 'NOW_SHOWING',
      genres: [],
    };
    FALLBACK_MOVIES.unshift(newMovie);
    await this.redis.delCacheByPattern('cache:home:*');
    return newMovie;
  }

  async updateMovie(id: number, dto: UpdateMovieDto) {
    if (this.prisma.isConnected()) {
      const existing = await this.prisma.movie.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException('Không tìm thấy phim.');

      const updated = await this.prisma.movie.update({
        where: { id },
        data: {
          title: dto.title ?? existing.title,
          description: dto.description ?? existing.description,
          duration: dto.duration !== undefined ? Number(dto.duration) : existing.duration,
          releaseDate: dto.releaseDate ? new Date(dto.releaseDate) : existing.releaseDate,
          trailerUrl: dto.trailerUrl !== undefined ? dto.trailerUrl : existing.trailerUrl,
          posterUrl: dto.posterUrl !== undefined ? dto.posterUrl : existing.posterUrl,
          bannerUrl: dto.bannerUrl !== undefined ? dto.bannerUrl : existing.bannerUrl,
          ageRating: dto.ageRating ?? existing.ageRating,
          director: dto.director !== undefined ? dto.director : existing.director,
          cast: dto.cast !== undefined ? dto.cast : existing.cast,
          status: (dto.status as MovieStatus) ?? existing.status,
        },
        include: { genres: { include: { genre: true } } },
      });
      await this.redis.delCacheByPattern('cache:home:*');
      return updated;
    }

    const idx = FALLBACK_MOVIES.findIndex((m) => m.id === id);
    if (idx === -1) throw new NotFoundException('Không tìm thấy phim.');
    FALLBACK_MOVIES[idx] = { ...FALLBACK_MOVIES[idx], ...dto } as any;
    await this.redis.delCacheByPattern('cache:home:*');
    return FALLBACK_MOVIES[idx];
  }

  async deleteMovie(id: number) {
    if (this.prisma.isConnected()) {
      const existing = await this.prisma.movie.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException('Không tìm thấy phim.');

      const showtimeCount = await this.prisma.showtime.count({ where: { movieId: id } });
      if (showtimeCount > 0) {
        const ended = await this.prisma.movie.update({
          where: { id },
          data: { status: MovieStatus.ENDED },
        });
        await this.redis.delCacheByPattern('cache:home:*');
        return {
          message: 'Phim đã có lịch chiếu nên được chuyển sang trạng thái ENDED.',
          movie: ended,
        };
      }

      await this.prisma.movie.delete({ where: { id } });
      await this.redis.delCacheByPattern('cache:home:*');
      return { message: 'Đã xóa phim thành công.' };
    }

    const idx = FALLBACK_MOVIES.findIndex((m) => m.id === id);
    if (idx !== -1) FALLBACK_MOVIES.splice(idx, 1);
    await this.redis.delCacheByPattern('cache:home:*');
    return { message: 'Đã xóa phim thành công.' };
  }
}

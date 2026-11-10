import { Controller, Get, Param, ParseIntPipe, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ShowtimesService } from './showtimes.service';
import { Public } from '../../common/decorators/public.decorator';
import { Request } from 'express';

@ApiTags('Showtimes')
@Controller('showtimes')
export class ShowtimesController {
  constructor(private readonly showtimesService: ShowtimesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Lọc lịch chiếu theo phim, rạp hoặc ngày' })
  @ApiQuery({ name: 'movieId', type: Number, required: false })
  @ApiQuery({ name: 'theaterId', type: Number, required: false })
  @ApiQuery({ name: 'date', type: String, required: false, description: 'Định dạng YYYY-MM-DD' })
  async findAll(
    @Query('movieId') movieId?: number,
    @Query('theaterId') theaterId?: number,
    @Query('date') date?: string,
  ) {
    return this.showtimesService.findAll({
      movieId: movieId ? Number(movieId) : undefined,
      theaterId: theaterId ? Number(theaterId) : undefined,
      date,
    });
  }

  @Public()
  @Get(':id/seats')
  @ApiOperation({ summary: 'Lấy sơ đồ và trạng thái ghế thời gian thực của suất chiếu' })
  async getSeats(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    return this.showtimesService.getShowtimeWithSeats(id, user?.id);
  }
}


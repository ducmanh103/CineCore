import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { ShowtimesService } from './showtimes.service';
import { CreateShowtimeDto } from './dto/showtime.dto';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleName } from '@prisma/client';
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

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Thêm suất chiếu mới và kiểm tra chống trùng giờ phòng chiếu (Admin/Staff)' })
  async create(@Body() dto: CreateShowtimeDto) {
    return this.showtimesService.createShowtime(dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa suất chiếu (Admin/Staff)' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.showtimesService.deleteShowtime(id);
  }
}



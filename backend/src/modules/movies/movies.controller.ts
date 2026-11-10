import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { MoviesService } from './movies.service';
import { MovieStatus } from '@prisma/client';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Movies')
@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Public()
  @Get('landing')
  @ApiOperation({ summary: 'Lấy dữ liệu tổng hợp cho trang chủ (Hero, Now Showing, Coming Soon, Theaters)' })
  async getLandingData() {
    return this.moviesService.getLandingData();
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Danh sách phim có phân loại theo trạng thái, từ khóa và thể loại' })
  @ApiQuery({ name: 'status', enum: MovieStatus, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiQuery({ name: 'genreId', type: Number, required: false })
  async findAll(
    @Query('status') status?: MovieStatus,
    @Query('search') search?: string,
    @Query('genreId') genreId?: number,
  ) {
    return this.moviesService.findAll({
      status,
      search,
      genreId: genreId ? Number(genreId) : undefined,
    });
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Xem chi tiết một bộ phim và các suất chiếu sắp tới' })
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.moviesService.findById(id);
  }
}


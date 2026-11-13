import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { MoviesService } from './movies.service';
import { CreateMovieDto, UpdateMovieDto } from './dto/movie.dto';
import { MovieStatus, RoleName } from '@prisma/client';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

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

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Thêm bộ phim mới (Admin/Staff)' })
  async create(@Body() dto: CreateMovieDto) {
    return this.moviesService.createMovie(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật thông tin phim (Admin/Staff)' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMovieDto) {
    return this.moviesService.updateMovie(id, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật nhanh thông tin phim (Admin/Staff)' })
  async patch(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMovieDto) {
    return this.moviesService.updateMovie(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.STAFF)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa hoặc ngừng chiếu phim (Admin/Staff)' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.moviesService.deleteMovie(id);
  }
}



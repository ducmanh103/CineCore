import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { MovieStatus } from '@prisma/client';

export class CreateMovieDto {
  @ApiProperty({ example: 'Kung Fu Panda 4', description: 'Tên bộ phim' })
  @IsString()
  @IsNotEmpty({ message: 'Tên phim không được để trống' })
  title: string;

  @ApiProperty({ example: 'Mô tả nội dung phim...', description: 'Mô tả chi tiết' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 120, description: 'Thời lượng phim (phút)' })
  @IsInt()
  @Min(1)
  duration: number;

  @ApiProperty({ example: '2026-11-20', description: 'Ngày khởi chiếu' })
  @IsOptional()
  @IsString()
  releaseDate?: string;

  @ApiProperty({ example: 'https://www.youtube.com/embed/...', required: false })
  @IsOptional()
  @IsString()
  trailerUrl?: string;

  @ApiProperty({ example: '/img/movies/kungfupanda4.jpg', required: false })
  @IsOptional()
  @IsString()
  posterUrl?: string;

  @ApiProperty({ example: '/img/movies/kungfupanda4-banner.jpg', required: false })
  @IsOptional()
  @IsString()
  bannerUrl?: string;

  @ApiProperty({ example: 'P', default: 'P', description: 'Phân loại độ tuổi (P, T13, T16, T18)' })
  @IsOptional()
  @IsString()
  ageRating?: string;

  @ApiProperty({ example: 'Mike Mitchell', required: false })
  @IsOptional()
  @IsString()
  director?: string;

  @ApiProperty({ example: 'Jack Black, Awkwafina', required: false })
  @IsOptional()
  @IsString()
  cast?: string;

  @ApiProperty({ enum: MovieStatus, default: MovieStatus.NOW_SHOWING })
  @IsOptional()
  @IsEnum(MovieStatus)
  status?: MovieStatus;
}

export class UpdateMovieDto extends PartialType(CreateMovieDto) {}


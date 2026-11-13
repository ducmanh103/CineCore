import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateShowtimeDto {
  @ApiProperty({ example: 1, description: 'ID bộ phim' })
  @IsInt()
  @IsNotEmpty()
  movieId: number;

  @ApiProperty({ example: 1, description: 'ID phòng chiếu' })
  @IsInt()
  @IsNotEmpty()
  roomId: number;

  @ApiProperty({ example: '2026-11-20T19:00:00.000Z', description: 'Thời gian bắt đầu suất chiếu (ISO 8601)' })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ example: 95000, description: 'Giá vé cơ bản (VNĐ)' })
  @IsNumber()
  @Min(0)
  price: number;
}


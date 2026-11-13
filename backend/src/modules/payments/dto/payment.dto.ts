import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateVnpayUrlDto {
  @ApiProperty({ example: 'BK1763063992356', description: 'Mã đơn đặt vé CineCore' })
  @IsString()
  @IsNotEmpty({ message: 'Mã đơn đặt vé không được để trống' })
  bookingCode: string;
}


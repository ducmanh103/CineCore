import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsInt, IsNotEmpty } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class CreateBookingDto {
  @ApiProperty({ example: 1, description: 'ID suất chiếu' })
  @IsInt()
  @IsNotEmpty()
  showtimeId: number;

  @ApiProperty({ example: [1, 2], description: 'Danh sách ID các ghế cần đặt' })
  @IsArray()
  @IsNotEmpty()
  seatIds: number[];

  @ApiProperty({ enum: PaymentMethod, default: PaymentMethod.VNPAY, description: 'Phương thức thanh toán' })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}


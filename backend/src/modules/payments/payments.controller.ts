import { Controller, Post, Get, Body, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { Request } from 'express';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('create-vnpay-url')
  @ApiOperation({ summary: 'Tạo URL chuyển hướng thanh toán VNPay' })
  async createUrl(
    @Body('bookingCode') bookingCode: string,
    @Req() req: Request,
  ) {
    const ip = req.ip || '127.0.0.1';
    return this.paymentsService.createVnpayUrl(bookingCode, ip);
  }

  @Public()
  @Get('vnpay-return')
  @ApiOperation({ summary: 'Xác thực và cập nhật kết quả thanh toán từ VNPay Return URL' })
  async vnpayReturn(@Query() query: Record<string, string>) {
    return this.paymentsService.processVnpayReturn(query);
  }
}


import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { PaymentStatus, TicketStatus } from '@prisma/client';
import { VietnamTime } from '../../common/utils/vietnam-time.util';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Tạo URL thanh toán VNPay Sandbox
   */
  async createVnpayUrl(bookingCode: string, ipAddr = '127.0.0.1') {
    let paymentAmount = 100000;

    if (this.prisma.isConnected()) {
      const payment = await this.prisma.payment.findUnique({
        where: { bookingCode },
        include: { tickets: true },
      });

      if (!payment) {
        throw new BadRequestException('Không tìm thấy thông tin thanh toán.');
      }

      if (payment.status !== PaymentStatus.PENDING) {
        throw new BadRequestException('Đơn hàng đã được thanh toán hoặc đã hủy.');
      }

      paymentAmount = Number(payment.amount);
    }

    const tmnCode = this.configService.get<string>('VNPAY_TMN_CODE', 'SANDBOX_TMN');
    const hashSecret = this.configService.get<string>('VNPAY_HASH_SECRET', 'SANDBOX_HASH');
    const vnpUrl = this.configService.get<string>(
      'VNPAY_URL',
      'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    );
    const returnUrl = this.configService.get<string>(
      'VNPAY_RETURN_URL',
      'http://localhost:5173/booking/vnpay-return',
    );

    // Múi giờ Việt Nam (GMT+7) định dạng yyyyMMddHHmmss
    const vnNow = VietnamTime.now();
    const createDate = [
      vnNow.getUTCFullYear(),
      String(vnNow.getUTCMonth() + 1).padStart(2, '0'),
      String(vnNow.getUTCDate()).padStart(2, '0'),
      String(vnNow.getUTCHours()).padStart(2, '0'),
      String(vnNow.getUTCMinutes()).padStart(2, '0'),
      String(vnNow.getUTCSeconds()).padStart(2, '0'),
    ].join('');

    const vnpParams: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: bookingCode,
      vnp_OrderInfo: `Thanh toan ve xem phim ma ${bookingCode}`,
      vnp_OrderType: 'other',
      vnp_Amount: (paymentAmount * 100).toString(),
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    };

    // Sắp xếp params theo thứ tự alphabet
    const sortedKeys = Object.keys(vnpParams).sort();
    const signData = sortedKeys
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(vnpParams[key])}`)
      .join('&');

    const hmac = crypto.createHmac('sha512', hashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    const paymentUrl = `${vnpUrl}?${signData}&vnp_SecureHash=${signed}`;
    return { paymentUrl, bookingCode };
  }

  /**
   * Xử lý VNPay Return URL (Khách hàng quay lại sau thanh toán)
   */
  async processVnpayReturn(query: Record<string, string>) {
    const hashSecret = this.configService.get<string>('VNPAY_HASH_SECRET', 'SANDBOX_HASH');
    const receivedHash = query['vnp_SecureHash'];

    const params: Record<string, string> = {};
    for (const key of Object.keys(query)) {
      if (key !== 'vnp_SecureHash' && key !== 'vnp_SecureHashType') {
        params[key] = query[key];
      }
    }

    const sortedKeys = Object.keys(params).sort();
    const signData = sortedKeys
      .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
      .join('&');

    const checkHash = crypto
      .createHmac('sha512', hashSecret)
      .update(Buffer.from(signData, 'utf-8'))
      .digest('hex');

    const isSignatureValid = receivedHash === checkHash;
    const bookingCode = query['vnp_TxnRef'];
    const responseCode = query['vnp_ResponseCode'];
    const isSuccess = responseCode === '00';

    if (bookingCode && this.prisma.isConnected()) {
      const payment = await this.prisma.payment.findUnique({
        where: { bookingCode },
        include: { tickets: true },
      });

      if (payment && payment.status === PaymentStatus.PENDING) {
        if (isSuccess) {
          // Cập nhật vé sang BOOKED, payment sang COMPLETED
          await this.prisma.$transaction([
            this.prisma.payment.update({
              where: { id: payment.id },
              data: {
                status: PaymentStatus.COMPLETED,
                transactionId: query['vnp_TransactionNo'] || null,
                vnpResponseCode: responseCode,
                paidAt: new Date(),
              },
            }),
            this.prisma.ticket.updateMany({
              where: { paymentId: payment.id },
              data: { status: TicketStatus.BOOKED, heldUntil: null },
            }),
          ]);

          // Xóa lock tạm thời trên Redis vì vé đã thành công chốt vào DB
          for (const t of payment.tickets) {
            await this.redis.releaseSeatLocks(t.showtimeId, [t.seatId]);
          }
        } else {
          // Thanh toán thất bại -> chuyển payment sang FAILED
          await this.prisma.payment.update({
            where: { id: payment.id },
            data: { status: PaymentStatus.FAILED, vnpResponseCode: responseCode },
          });
        }
      }
    }

    return {
      isValid: isSignatureValid,
      isSuccess,
      bookingCode,
      responseCode,
      message: isSuccess
        ? 'Thanh toán thành công qua VNPay'
        : 'Giao dịch thanh toán chưa hoàn tất hoặc bị hủy',
    };
  }
}


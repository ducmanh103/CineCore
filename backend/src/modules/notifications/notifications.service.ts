import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import axios from 'axios';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter: nodemailer.Transporter | null = null;
  private readonly telegramBotToken: string;
  private readonly telegramChatId: string;

  constructor(private readonly configService: ConfigService) {
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpPort = this.configService.get<number>('SMTP_PORT', 587);
    const smtpUser = this.configService.get<string>('SMTP_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASS');

    if (smtpUser && smtpPass) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
    }

    this.telegramBotToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN') || '';
    this.telegramChatId = this.configService.get<string>('TELEGRAM_CHAT_ID') || '';
  }

  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    // Luôn trích xuất mã OTP để in to rõ ràng trên terminal phục vụ kiểm thử Local Dev
    const otpMatch = html.match(/\b([0-9]{6})\b/);
    const otp = otpMatch ? otpMatch[1] : null;

    if (otp || process.env.NODE_ENV !== 'production') {
      console.log('\n========================================================================');
      console.log('🔔 [CINECORE LOCAL DEV - EMAIL NOTIFICATION]');
      console.log(`📧 Người nhận (To)  : ${to}`);
      console.log(`📌 Tiêu đề (Subject): ${subject}`);
      if (otp) {
        console.log(`🔑 MÃ OTP CỦA BẠN   : >>> [ ${otp} ] <<<`);
        console.log(`💡 Mẹo Local Dev    : Bạn có thể nhập mã này hoặc mã test: 123456`);
      }
      console.log('========================================================================\n');
    }

    if (!this.transporter) {
      this.logger.warn(`SMTP chưa được cấu hình (SMTP_USER/PASS trống). OTP đã in tại console.`);
      return true;
    }

    try {
      const from = this.configService.get<string>(
        'MAIL_FROM',
        '"CineCore Support" <no-reply@cinecore.vn>',
      );
      await this.transporter.sendMail({
        from,
        to,
        subject,
        html,
      });
      this.logger.log(`Đã gửi email thành công tới ${to}`);
      return true;
    } catch (err: any) {
      this.logger.error(`Lỗi khi gửi email tới ${to}: ${err.message}`);
      return false;
    }
  }

  async sendTelegramAlert(message: string): Promise<boolean> {
    if (!this.telegramBotToken || !this.telegramChatId) {
      this.logger.warn(`Telegram Bot chưa được cấu hình. Cảnh báo an ninh: ${message}`);
      return false;
    }

    try {
      const url = `https://api.telegram.org/bot${this.telegramBotToken}/sendMessage`;
      await axios.post(url, {
        chat_id: this.telegramChatId,
        text: `🚨 [CineCore Security Alert]\n${message}`,
        parse_mode: 'HTML',
      });
      return true;
    } catch (err) {
      this.logger.error(`Lỗi khi gửi cảnh báo Telegram: ${err.message}`);
      return false;
    }
  }
}


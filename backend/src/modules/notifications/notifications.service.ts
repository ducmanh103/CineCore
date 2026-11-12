import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly telegramBotToken: string;
  private readonly telegramChatId: string;

  constructor(private readonly configService: ConfigService) {
    this.telegramBotToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN') || '';
    this.telegramChatId = this.configService.get<string>('TELEGRAM_CHAT_ID') || '';
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
    } catch (err: any) {
      this.logger.error(`Lỗi khi gửi cảnh báo Telegram: ${err.message}`);
      return false;
    }
  }
}


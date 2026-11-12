import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private isDbConnected = false;

  async onModuleInit() {
    try {
      await this.$connect();
      this.isDbConnected = true;
      this.logger.log('Đã kết nối thành công tới cơ sở dữ liệu PostgreSQL 16.');
    } catch {
      this.isDbConnected = false;
      this.logger.warn(
        'PostgreSQL (localhost:5432) chưa khả dụng. Hệ thống chuyển sang chế độ dữ liệu dự phòng (Fault-tolerant Fallback).',
      );
    }
  }

  isConnected(): boolean {
    return this.isDbConnected;
  }

  async onModuleDestroy() {
    if (this.isDbConnected) {
      await this.$disconnect();
      this.logger.log('Đã ngắt kết nối cơ sở dữ liệu PostgreSQL.');
    }
  }
}


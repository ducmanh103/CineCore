import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { PiiCryptoService } from '../../common/crypto/pii-crypto.service';

@Module({
  controllers: [AdminController],
  providers: [AdminService, PiiCryptoService],
  exports: [AdminService],
})
export class AdminModule {}


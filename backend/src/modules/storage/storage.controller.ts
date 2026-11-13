import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleName } from '@prisma/client';

interface UploadedFilePayload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@ApiTags('Storage')
@Controller('storage')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleName.ADMIN, RoleName.STAFF)
@ApiBearerAuth()
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Tải file ảnh lên local storage (Kiểm tra Magic Bytes)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: UploadedFilePayload) {
    if (!file || !file.buffer) {
      throw new BadRequestException('Vui lòng chọn tệp ảnh cần tải lên.');
    }
    const url = await this.storageService.saveFile(file.buffer, file.originalname);
    return { url };
  }

  @Post('remote')
  @ApiOperation({ summary: 'Tải ảnh từ remote URL về local (Chống SSRF)' })
  async downloadRemote(@Body('url') url: string) {
    if (!url) {
      throw new BadRequestException('Vui lòng cung cấp URL ảnh hợp lệ.');
    }
    const localUrl = await this.storageService.downloadAndSaveRemoteUrl(url);
    return { url: localUrl };
  }
}



import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly uploadDir = path.resolve(__dirname, '..', '..', '..', 'uploads');

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Lưu buffer file vào thư mục local uploads
   */
  async saveFile(buffer: Buffer, originalname: string): Promise<string> {
    this.validateMagicBytes(buffer);

    const ext = path.extname(originalname).toLowerCase();
    const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
    const filePath = path.join(this.uploadDir, filename);

    await fs.promises.writeFile(filePath, buffer);
    return `/uploads/${filename}`;
  }

  /**
   * Tải ảnh từ URL ngoài về local và bảo vệ chống SSRF
   */
  async downloadAndSaveRemoteUrl(url: string): Promise<string> {
    this.validateUrlSsrf(url);

    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 10000,
        maxContentLength: 10 * 1024 * 1024, // 10MB
      });

      const buffer = Buffer.from(response.data);
      this.validateMagicBytes(buffer);

      const ext = this.getExtensionFromBuffer(buffer) || '.jpg';
      const filename = `remote-${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
      const filePath = path.join(this.uploadDir, filename);

      await fs.promises.writeFile(filePath, buffer);
      return `/uploads/${filename}`;
    } catch (err) {
      this.logger.error(`Lỗi khi tải ảnh từ URL ${url}: ${err.message}`);
      throw new BadRequestException('Không thể tải hoặc xử lý ảnh từ URL được cung cấp.');
    }
  }

  /**
   * Kiểm tra Magic Bytes chống tải tệp độc hại
   */
  private validateMagicBytes(buffer: Buffer) {
    if (buffer.length < 4) {
      throw new BadRequestException('Tệp tải lên không hợp lệ.');
    }

    const hex = buffer.toString('hex', 0, 4).toUpperCase();

    // JPEG: FFD8FF
    const isJpeg = hex.startsWith('FFD8FF');
    // PNG: 89504E47
    const isPng = hex === '89504E47';
    // GIF: 47494638
    const isGif = hex === '47494638';
    // WEBP: RIFF....WEBP (52494646)
    const isWebp = hex === '52494646' && buffer.toString('ascii', 8, 12) === 'WEBP';

    if (!isJpeg && !isPng && !isGif && !isWebp) {
      throw new BadRequestException(
        'Định dạng tệp không được hỗ trợ. Chỉ chấp nhận JPG, PNG, GIF, WEBP hợp lệ.',
      );
    }
  }

  private getExtensionFromBuffer(buffer: Buffer): string {
    const hex = buffer.toString('hex', 0, 4).toUpperCase();
    if (hex.startsWith('FFD8FF')) return '.jpg';
    if (hex === '89504E47') return '.png';
    if (hex === '47494638') return '.gif';
    if (hex === '52494646') return '.webp';
    return '.jpg';
  }

  /**
   * Kiểm tra URL chống SSRF (chặn IP private / loopback / metadata)
   */
  private validateUrlSsrf(inputUrl: string) {
    try {
      const parsed = new URL(inputUrl);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new BadRequestException('Chỉ chấp nhận URL giao thức HTTP hoặc HTTPS.');
      }

      const host = parsed.hostname.toLowerCase();
      if (
        host === 'localhost' ||
        host === '127.0.0.1' ||
        host === '::1' ||
        host.startsWith('10.') ||
        host.startsWith('192.168.') ||
        host.startsWith('169.254.') ||
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(host)
      ) {
        throw new BadRequestException('Địa chỉ URL không hợp lệ hoặc bị chặn vì lý do bảo mật.');
      }
    } catch {
      throw new BadRequestException('URL không hợp lệ.');
    }
  }
}


import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class PiiCryptoService {
  private readonly logger = new Logger(PiiCryptoService.name);
  private readonly key: Buffer;
  private readonly salt: string;

  constructor(private readonly configService: ConfigService) {
    const rawKey =
      this.configService.get<string>('PII_ENCRYPTION_KEY') ||
      '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    this.key = Buffer.from(rawKey, 'hex');

    this.salt =
      this.configService.get<string>('PII_BLIND_INDEX_SALT') ||
      'cinemahub_pii_blind_index_salt_secure_2026';
  }

  /**
   * Encrypt sensitive PII field (fullName, email) using AES-256-GCM
   * Output format: ENC:v1:<iv_hex>:<authTag_hex>:<ciphertext_hex>
   */
  encrypt(text: string): string {
    if (!text || text.startsWith('ENC:v1:')) {
      return text;
    }

    try {
      const iv = crypto.randomBytes(12); // 96-bit IV recommended for GCM
      const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);
      const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
      const authTag = cipher.getAuthTag();

      return `ENC:v1:${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
    } catch (err) {
      this.logger.error(`Failed to encrypt PII data: ${err.message}`);
      throw err;
    }
  }

  /**
   * Decrypt AES-256-GCM ciphertext
   */
  decrypt(encryptedText: string): string {
    if (!encryptedText || !encryptedText.startsWith('ENC:v1:')) {
      return encryptedText;
    }

    try {
      const parts = encryptedText.split(':');
      if (parts.length !== 5) {
        return encryptedText;
      }

      const [, , ivHex, authTagHex, cipherHex] = parts;
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const ciphertext = Buffer.from(cipherHex, 'hex');

      const decipher = crypto.createDecipheriv('aes-256-gcm', this.key, iv);
      decipher.setAuthTag(authTag);

      const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
      return decrypted.toString('utf8');
    } catch (err) {
      this.logger.warn(`Failed to decrypt PII data (data might be unencrypted): ${err.message}`);
      return encryptedText;
    }
  }

  /**
   * Compute Blind Index HMAC-SHA256 for exact O(1) email lookups
   */
  computeEmailHash(email: string): string {
    if (!email) return '';
    const normalized = email.trim().toLowerCase();
    return crypto.createHmac('sha256', this.salt).update(normalized).digest('hex');
  }
}


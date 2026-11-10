import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private isConnected = false;

  // In-memory fallback khi Redis 7 chưa được bật hoặc chạy local
  private readonly memStore = new Map<string, { value: string; expiresAt: number }>();

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = Number(this.configService.get<number>('REDIS_PORT', 6379));
    const password = this.configService.get<string>('REDIS_PASSWORD', 'redis123');

    try {
      this.client = new Redis({
        host,
        port,
        password: password || undefined,
        retryStrategy: (times) => {
          if (times > 3) return null; // stop retrying after 3 attempts
          return Math.min(times * 1000, 2000);
        },
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
        lazyConnect: true,
      });

      this.client.connect().then(() => {
        this.isConnected = true;
        this.logger.log(`Đã kết nối thành công tới Redis 7 tại ${host}:${port}`);
      }).catch((err) => {
        this.isConnected = false;
        this.logger.warn(`Redis 7 (${host}:${port}) chưa khả dụng: ${err.message}. Hệ thống chuyển sang chế độ dự phòng.`);
      });

      this.client.on('error', (err) => {
        this.isConnected = false;
      });

      this.client.on('ready', () => {
        this.isConnected = true;
      });
    } catch (e: any) {
      this.logger.warn(`Không thể khởi tạo kết nối Redis: ${e.message}`);
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      try {
        await this.client.quit();
      } catch {}
      this.logger.log('Đã ngắt kết nối Redis 7.');
    }
  }

  getClient(): Redis | null {
    return this.client;
  }

  private isReady(): boolean {
    return !!this.client && this.client.status === 'ready';
  }

  // ==========================================
  // DISTRIBUTED SEAT LOCK (Zero Overbooking)
  // ==========================================

  async acquireSeatLocks(
    showtimeId: number,
    seatIds: number[],
    userId: number,
    ttlSeconds = 900,
  ): Promise<{ success: boolean; lockedSeats: number[] }> {
    if (!this.isReady()) {
      // Nếu Redis chưa bật, cho phép đi tiếp để PostgreSQL Transaction xử lý
      return { success: true, lockedSeats: seatIds };
    }

    const acquired: number[] = [];
    try {
      for (const seatId of seatIds) {
        const key = `seat:lock:${showtimeId}:${seatId}`;
        const result = await this.client!.set(key, userId.toString(), 'EX', ttlSeconds, 'NX');
        if (result === 'OK') {
          acquired.push(seatId);
        } else {
          await this.releaseSeatLocks(showtimeId, acquired);
          return { success: false, lockedSeats: [] };
        }
      }
      return { success: true, lockedSeats: acquired };
    } catch {
      return { success: true, lockedSeats: seatIds };
    }
  }

  async releaseSeatLocks(showtimeId: number, seatIds: number[]): Promise<void> {
    if (!this.isReady() || !seatIds.length) return;
    try {
      const keys = seatIds.map((id) => `seat:lock:${showtimeId}:${id}`);
      await this.client!.del(...keys);
    } catch {}
  }

  // ==========================================
  // BRUTE-FORCE PROTECTION
  // ==========================================

  async isAccountLocked(username: string): Promise<boolean> {
    if (!this.isReady()) return false;
    try {
      const lockKey = `auth:lock:${username.toLowerCase()}`;
      const isLocked = await this.client!.exists(lockKey);
      return isLocked === 1;
    } catch {
      return false;
    }
  }

  async recordLoginFailure(
    username: string,
    maxAttempts = 5,
    lockDuration = 900,
  ): Promise<{ attempts: number; isLocked: boolean }> {
    if (!this.isReady()) return { attempts: 1, isLocked: false };
    try {
      const norm = username.toLowerCase();
      const failKey = `auth:fail:${norm}`;
      const lockKey = `auth:lock:${norm}`;

      const attempts = await this.client!.incr(failKey);
      if (attempts === 1) {
        await this.client!.expire(failKey, 1800);
      }

      if (attempts >= maxAttempts) {
        await this.client!.set(lockKey, 'locked', 'EX', lockDuration);
        await this.client!.del(failKey);
        return { attempts, isLocked: true };
      }

      return { attempts, isLocked: false };
    } catch {
      return { attempts: 1, isLocked: false };
    }
  }

  async clearLoginFailures(username: string): Promise<void> {
    if (!this.isReady()) return;
    try {
      const norm = username.toLowerCase();
      await this.client!.del(`auth:fail:${norm}`, `auth:lock:${norm}`);
    } catch {}
  }

  // ==========================================
  // SECURITY STAMP (Revocation O(1))
  // ==========================================

  async setUserStamp(userId: number, stamp: string, ttl = 3600): Promise<void> {
    const key = `user:stamp:${userId}`;
    this.memStore.set(key, { value: stamp, expiresAt: Date.now() + ttl * 1000 });
    if (!this.isReady()) return;
    try {
      await this.client!.set(key, stamp, 'EX', ttl);
    } catch {}
  }

  async getUserStamp(userId: number): Promise<string | null> {
    const key = `user:stamp:${userId}`;
    if (!this.isReady()) {
      const entry = this.memStore.get(key);
      if (!entry || Date.now() > entry.expiresAt) return null;
      return entry.value;
    }
    try {
      return await this.client!.get(key);
    } catch {
      const entry = this.memStore.get(key);
      if (!entry || Date.now() > entry.expiresAt) return null;
      return entry.value;
    }
  }

  async deleteUserStamp(userId: number): Promise<void> {
    const key = `user:stamp:${userId}`;
    this.memStore.delete(key);
    if (!this.isReady()) return;
    try {
      await this.client!.del(key);
    } catch {}
  }

  // ==========================================
  // OTP & MFA SESSIONS (with In-Memory Fallback)
  // ==========================================

  async setOtpSession(key: string, data: any, ttlSeconds = 900): Promise<void> {
    const serialized = JSON.stringify(data);
    if (!this.isReady()) {
      this.memStore.set(key, {
        value: serialized,
        expiresAt: Date.now() + ttlSeconds * 1000,
      });
      return;
    }
    try {
      await this.client!.set(key, serialized, 'EX', ttlSeconds);
    } catch {
      this.memStore.set(key, {
        value: serialized,
        expiresAt: Date.now() + ttlSeconds * 1000,
      });
    }
  }

  async getOtpSession<T>(key: string): Promise<T | null> {
    if (!this.isReady()) {
      const entry = this.memStore.get(key);
      if (!entry) return null;
      if (Date.now() > entry.expiresAt) {
        this.memStore.delete(key);
        return null;
      }
      try {
        return JSON.parse(entry.value) as T;
      } catch {
        return null;
      }
    }
    try {
      const raw = await this.client!.get(key);
      if (!raw) {
        // Fallback to memStore if previously saved in memory
        const entry = this.memStore.get(key);
        if (entry && Date.now() <= entry.expiresAt) {
          return JSON.parse(entry.value) as T;
        }
        return null;
      }
      return JSON.parse(raw) as T;
    } catch {
      const entry = this.memStore.get(key);
      if (entry && Date.now() <= entry.expiresAt) {
        return JSON.parse(entry.value) as T;
      }
      return null;
    }
  }

  async deleteKey(key: string): Promise<void> {
    this.memStore.delete(key);
    if (!this.isReady()) return;
    try {
      await this.client!.del(key);
    } catch {}
  }

  // ==========================================
  // GENERAL CACHE HELPERS (with In-Memory Fallback)
  // ==========================================

  async getCache<T>(key: string): Promise<T | null> {
    if (!this.isReady()) {
      const entry = this.memStore.get(key);
      if (!entry) return null;
      if (Date.now() > entry.expiresAt) {
        this.memStore.delete(key);
        return null;
      }
      try {
        return JSON.parse(entry.value) as T;
      } catch {
        return null;
      }
    }
    try {
      const val = await this.client!.get(key);
      if (!val) return null;
      return JSON.parse(val) as T;
    } catch {
      return null;
    }
  }

  async setCache(key: string, value: any, ttlSeconds = 120): Promise<void> {
    const serialized = JSON.stringify(value);
    if (!this.isReady()) {
      this.memStore.set(key, {
        value: serialized,
        expiresAt: Date.now() + ttlSeconds * 1000,
      });
      return;
    }
    try {
      await this.client!.set(key, serialized, 'EX', ttlSeconds);
    } catch {
      this.memStore.set(key, {
        value: serialized,
        expiresAt: Date.now() + ttlSeconds * 1000,
      });
    }
  }

  async delCacheByPattern(pattern: string): Promise<void> {
    // Clean matching from memStore
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    for (const k of this.memStore.keys()) {
      if (regex.test(k)) {
        this.memStore.delete(k);
      }
    }

    if (!this.isReady()) return;
    try {
      const keys = await this.client!.keys(pattern);
      if (keys.length > 0) {
        await this.client!.del(...keys);
      }
    } catch {}
  }
}

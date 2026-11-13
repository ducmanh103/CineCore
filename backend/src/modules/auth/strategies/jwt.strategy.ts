import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';

export interface JwtPayload {
  sub: number;
  username: string;
  role: string;
  securityStamp: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req) => req?.cookies?.access_token || null,
      ]),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') ||
        'cinemahub_super_secret_jwt_access_token_key_2026_min_32_chars!',
    });
  }

  async validate(payload: JwtPayload) {
    // 1. Kiểm tra nhanh qua Redis Security Stamp O(1)
    const cachedStamp = await this.redis.getUserStamp(payload.sub);
    if (cachedStamp && cachedStamp !== payload.securityStamp) {
      throw new UnauthorizedException('Phiên làm việc đã bị thu hồi do đổi mật khẩu hoặc cập nhật bảo mật.');
    }

    // 2. Nếu Redis chưa có stamp -> kiểm tra DB (hoặc cho phép fallback nếu DB offline)
    if (!cachedStamp) {
      if (this.prisma.isConnected()) {
        try {
          const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            include: { role: true },
          });

          if (!user || user.status !== 'ACTIVE' || user.securityStamp !== payload.securityStamp) {
            throw new UnauthorizedException('Tài khoản không tồn tại, đã bị khóa hoặc phiên hết hạn.');
          }

          await this.redis.setUserStamp(user.id, user.securityStamp, 3600);
          return {
            id: user.id,
            username: user.username,
            role: user.role.name,
            securityStamp: user.securityStamp,
          };
        } catch (err) {
          if (err instanceof UnauthorizedException) throw err;
        }
      }

      await this.redis.setUserStamp(payload.sub, payload.securityStamp, 3600);
    }

    return {
      id: payload.sub,
      username: payload.username,
      role: payload.role,
      securityStamp: payload.securityStamp,
    };
  }
}


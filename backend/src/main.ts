import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';

async function bootstrap() {
  const logger = new Logger('CineCore-Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Global Prefix
  app.setGlobalPrefix('api');

  // Cookie Parser
  app.use(cookieParser());

  // CORS Configuration
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  app.enableCors({
    origin: [frontendUrl, 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Static files for uploaded images (/uploads)
  app.useStaticAssets(path.join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  // Swagger Documentation (/api/docs)
  const config = new DocumentBuilder()
    .setTitle('CineCore API Documentation')
    .setDescription('Tài liệu API nền tảng đặt vé xem phim CineCore (NestJS 11 + PostgreSQL 16 + Redis 7)')
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('access_token')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`🚀 CineCore Backend API đang chạy tại: http://localhost:${port}/api`);
  logger.log(`📚 Swagger API Docs có sẵn tại: http://localhost:${port}/api/docs`);
}

bootstrap();


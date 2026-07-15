import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { resolve } from 'path';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Security headers (X-Content-Type-Options, X-Frame-Options, HSTS,
  // a default Content-Security-Policy, etc). crossOriginResourcePolicy is
  // relaxed to "cross-origin": helmet's default ("same-origin") would
  // otherwise block browsers from loading media served from /uploads
  // (see LocalStorageProvider) when embedded on a different origin —
  // which is the whole point of this backend's public media/content.
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = app.get(ConfigService);

  // CORS: public content routes are open by design (cacheable,
  // unauthenticated) and admin routes are protected by the SMS-JWT guard
  // regardless of origin — CORS here only controls which origins a
  // browser will let read the response, not authorization. Defaults to
  // "*" (today's behavior, unchanged) unless CORS_ALLOWED_ORIGINS is set
  // to a comma-separated allow-list for production deployments.
  const corsOrigins = config.get<string>('CORS_ALLOWED_ORIGINS');
  app.enableCors({
    origin: corsOrigins
      ? corsOrigins.split(',').map((origin) => origin.trim())
      : '*',
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: false,
  });

  // Serve locally-stored media (see LocalStorageProvider) at the same
  // "/uploads/<key>" path each Media row's `url` points to. Only mounted
  // when STORAGE_DRIVER isn't "s3" — with the S3-compatible driver, files
  // are served directly from the S3 endpoint/CDN instead, and this
  // directory may not even exist.
  if (config.get<string>('STORAGE_DRIVER', 'local') !== 's3') {
    const localStoragePath = config.get<string>('LOCAL_STORAGE_PATH', './uploads');
    app.useStaticAssets(resolve(localStoragePath), {
      prefix: '/uploads',
      index: false,
      redirect: false,
    });
  }

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3100;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`nhg-website-backend listening on :${port}`);
}
bootstrap();

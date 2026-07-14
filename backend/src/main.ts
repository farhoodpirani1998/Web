import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { resolve } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS: public routes are open by design (cacheable, unauthenticated);
  // admin routes still go through the SMS-JWT guard regardless of origin.
  app.enableCors();

  // Serve locally-stored media (see LocalStorageProvider) at the same
  // "/uploads/<key>" path each Media row's `url` points to. Only mounted
  // when STORAGE_DRIVER isn't "s3" — with the S3-compatible driver, files
  // are served directly from the S3 endpoint/CDN instead, and this
  // directory may not even exist.
  const config = app.get(ConfigService);
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

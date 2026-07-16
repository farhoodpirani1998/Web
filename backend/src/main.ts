// Loaded first, before any other import — module-level code elsewhere
// (e.g. public-api/common/public-rate-limit.constants.ts, evaluated at
// decorator-definition time, before Nest's DI/ConfigService exists)
// reads process.env directly and needs .env-file values already in
// place by then. Same reason data-source.ts calls dotenv's config()
// directly instead of relying on ConfigModule.
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { resolve } from 'path';
import helmet from 'helmet';
import { json, urlencoded } from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  // bodyParser: false — the default body-parser Nest would otherwise
  // register has a fixed limit that isn't configurable per deployment.
  // Replaced below with our own json()/urlencoded() using env-driven
  // limits (see BODY_LIMIT_JSON_BYTES / BODY_LIMIT_URLENCODED_BYTES).
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });

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

  // Request payload limits: protects against oversized-body abuse
  // (memory/CPU exhaustion) independent of auth — enforced by express's
  // parsers before a request body ever reaches a controller or
  // ValidationPipe. Configurable via BODY_LIMIT_JSON_BYTES /
  // BODY_LIMIT_URLENCODED_BYTES (see .env.example); falls back to 1 MiB
  // for each when unset (more generous than express's own built-in
  // 100kb default, but still bounded).
  app.use(json({ limit: config.get<number>('BODY_LIMIT_JSON_BYTES', 1_048_576) }));
  app.use(
    urlencoded({
      extended: true,
      limit: config.get<number>('BODY_LIMIT_URLENCODED_BYTES', 1_048_576),
    }),
  );

  // CORS: public content routes are open by design (cacheable,
  // unauthenticated) and admin routes are protected by the SMS-JWT guard
  // regardless of origin — CORS here only controls which origins a
  // browser will let read the response, not authorization. Defaults to
  // "*" (today's behavior, unchanged) unless CORS_ALLOWED_ORIGINS is set
  // to a comma-separated allow-list for production deployments.
  const corsOrigins = config
    .get<string>('CORS_ALLOWED_ORIGINS', '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.enableCors({
    origin: corsOrigins.length ? corsOrigins : '*',
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

  // API documentation (Swagger/OpenAPI). Reads request/response shapes
  // from the existing controller and DTO decorators already used for
  // validation (@Body, @Param, class-validator decorators, etc) — no
  // business logic touched. Left off in production by default so the
  // schema/UI isn't publicly exposed unless explicitly opted into via
  // SWAGGER_ENABLED=true.
  const swaggerEnabled =
    config.get<string>('NODE_ENV') !== 'production' ||
    config.get<string>('SWAGGER_ENABLED') === 'true';
  if (swaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('NHG Website Backend API')
      .setDescription(
        'Admin CMS + public content API for the Nedaye Haghighat Educational Group website.',
      )
      .setVersion(process.env.npm_package_version ?? '0.1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'SMS-issued JWT (RS256), verified against SMS_JWT_PUBLIC_KEY_PATH',
        },
        'sms-jwt',
      )
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3100;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`nhg-website-backend listening on :${port}`);
}
bootstrap();

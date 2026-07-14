import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3100;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`nhg-website-backend listening on :${port}`);
}
bootstrap();

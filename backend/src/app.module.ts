import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { WebsiteModule } from './modules/website/website.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        autoLoadEntities: true,
        // Migrations only in prod — never rely on synchronize outside local dev.
        synchronize: process.env.NODE_ENV !== 'production',
      }),
    }),
    // Global throttle as a floor; public read endpoints get a tighter,
    // route-specific limit once the public-api layer exists (Phase 6),
    // so a traffic spike on /public/* can't be amplified by this same
    // process serving admin writes.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 300 }]),
    WebsiteModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { WebsiteModule } from './modules/website/website.module';
import { resolveDatabaseSynchronize } from './config/database-synchronize.config';

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
        // Validated against DATABASE_SYNCHRONIZE + NODE_ENV; throws at startup
        // rather than ever letting synchronize run in production.
        synchronize: resolveDatabaseSynchronize(),
        // Schema changes are applied explicitly via `npm run migration:run`
        // (see src/data-source.ts), not automatically at boot. Multiple app
        // instances starting concurrently would otherwise race to apply the
        // same migration; running it as its own deploy step avoids that.
        migrations: ['dist/migrations/*.js'],
        migrationsRun: false,
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

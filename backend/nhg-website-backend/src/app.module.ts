import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { WebsiteModule } from './modules/website/website.module';
import { resolveDatabaseSynchronize } from './config/database-synchronize.config';
import { validateEnvironment } from './config/env-validation.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnvironment }),
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
    // Global throttle as a floor for every route. Public content routes
    // additionally override this 'default' throttler with a tighter,
    // dedicated limit via @Throttle(PUBLIC_THROTTLE) on each controller
    // (see public-api/common/public-rate-limit.constants.ts) — admin/auth
    // routes have no such override, so they're governed by this config
    // alone, unchanged.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 300 }]),
    WebsiteModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}

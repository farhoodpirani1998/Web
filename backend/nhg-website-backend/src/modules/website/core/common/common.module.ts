import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from './global-exception.filter';

/**
 * CommonModule has no dependencies — every other kernel module depends on
 * it directly (never transitively through a barrel). The base entities
 * here are plain classes consumed via import, not DI. The module is an
 * explicit anchor so cross-cutting providers (e.g. the global exception
 * filter below) have one obvious home; APP_FILTER is a global-scoped
 * token, so registering it here applies it app-wide exactly like
 * AppModule's APP_GUARD registration for ThrottlerGuard.
 */
@Module({
  providers: [{ provide: APP_FILTER, useClass: GlobalExceptionFilter }],
})
export class CommonModule {}

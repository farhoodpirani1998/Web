import { Module } from '@nestjs/common';

/**
 * CommonModule has no dependencies — every other kernel module depends on
 * it directly (never transitively through a barrel). It exports nothing
 * as providers today; the base entities here are plain classes consumed
 * via import, not DI. The module is an explicit anchor so future
 * cross-cutting providers (e.g. a shared logger) have one obvious home.
 */
@Module({})
export class CommonModule {}

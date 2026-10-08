import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';

/**
 * Kernel module for the Redis connection itself — same shape as
 * SiteModule/SeoModule (a single service, provided + exported, no
 * TypeOrmModule.forFeature since there's no entity here). Registered
 * once in WebsiteModule's imports like every other kernel module;
 * whichever module needs RedisService (the public-api caching layer,
 * once that's built) imports RedisModule directly in its own
 * `imports`, the same way content modules already import SeoModule.
 */
@Module({
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}

import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { MediaModule } from '../media/media.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [TerminusModule, MediaModule, RedisModule],
  controllers: [HealthController],
})
export class HealthModule {}

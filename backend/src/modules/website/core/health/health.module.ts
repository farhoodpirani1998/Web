import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [TerminusModule, MediaModule],
  controllers: [HealthController],
})
export class HealthModule {}

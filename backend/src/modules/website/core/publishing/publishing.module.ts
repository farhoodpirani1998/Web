import { Module } from '@nestjs/common';
import { EventsModule } from '../events/events.module';
import { PublishingService } from './publishing.service';

@Module({
  imports: [EventsModule],
  providers: [PublishingService],
  exports: [PublishingService],
})
export class PublishingModule {}

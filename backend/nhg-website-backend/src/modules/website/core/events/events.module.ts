import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

/**
 * Thin wrapper around @nestjs/event-emitter. This is the backbone of the
 * write-path -> cache-invalidation link: content services emit events on
 * write, and the public-api layer's listeners invalidate cache keys in
 * response — never a direct call from a content service into public-api.
 */
@Module({
  imports: [EventEmitterModule.forRoot()],
  exports: [EventEmitterModule],
})
export class EventsModule {}

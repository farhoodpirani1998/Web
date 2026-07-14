import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PublishStatus, VALID_TRANSITIONS } from './publish-status.enum';
import {
  WEBSITE_EVENTS,
  ContentPublishedPayload,
  ContentUpdatedPayload,
} from '../events/events.constants';

/**
 * Central authority for draft/published/archived transitions. Content
 * services call transition() rather than mutating a status column
 * directly, so every state change is validated the same way and emits
 * the same event, which is what drives cache invalidation downstream.
 */
@Injectable()
export class PublishingService {
  constructor(private readonly events: EventEmitter2) {}

  assertValidTransition(from: PublishStatus, to: PublishStatus) {
    if (!VALID_TRANSITIONS[from]?.includes(to)) {
      throw new BadRequestException(
        `Invalid publish transition: ${from} -> ${to}`,
      );
    }
  }

  transition(params: {
    from: PublishStatus;
    to: PublishStatus;
    entityType: string;
    entityId: string;
    siteId: string;
  }) {
    this.assertValidTransition(params.from, params.to);

    const updatedPayload: ContentUpdatedPayload = {
      entityType: params.entityType,
      entityId: params.entityId,
      siteId: params.siteId,
    };
    this.events.emit(WEBSITE_EVENTS.CONTENT_UPDATED, updatedPayload);

    if (params.to === PublishStatus.PUBLISHED) {
      const publishedPayload: ContentPublishedPayload = {
        ...updatedPayload,
        publishedAt: new Date(),
      };
      this.events.emit(WEBSITE_EVENTS.CONTENT_PUBLISHED, publishedPayload);
    }

    return params.to;
  }
}

import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AuditLogService } from './audit-log.service';
import { SiteService } from '../site/site.service';
import {
  WEBSITE_EVENTS,
  ContentUpdatedPayload,
  SettingsUpdatedPayload,
} from '../events/events.constants';

/**
 * Populates `audit_log_entries` purely by listening to events every
 * content/media/settings service already emits — no content service,
 * controller, or DTO is touched to make this work (see
 * `SiteSettingsService`'s own doc comment, which already anticipated
 * "an audit log" as a `SETTINGS_UPDATED` listener).
 *
 * `CONTENT_PUBLISHED` is deliberately NOT listened to here, even though
 * it exists: `PublishingService.transition()` always emits
 * `CONTENT_UPDATED` first (with `status` already set to the same `to`
 * value `CONTENT_PUBLISHED` would carry), and additionally emits
 * `CONTENT_PUBLISHED` only when that status is `published`. Listening
 * to both would double-log every publish action as two rows for one
 * transition — `CONTENT_UPDATED` alone already carries everything this
 * listener needs for any transition, publish included.
 *
 * No `authorId` on the row this writes: none of these events carry one
 * today (see `AuditLogEntry`'s own doc comment for why, and what
 * changes if that's ever added).
 */
@Injectable()
export class AuditLogListener {
  constructor(
    private readonly auditLog: AuditLogService,
    private readonly siteService: SiteService,
  ) {}

  @OnEvent(WEBSITE_EVENTS.CONTENT_UPDATED)
  async handleContentUpdated(payload: ContentUpdatedPayload) {
    await this.auditLog.record({
      siteId: payload.siteId,
      action: payload.status,
      entityType: payload.entityType,
      entityId: payload.entityId,
    });
  }

  @OnEvent(WEBSITE_EVENTS.MEDIA_UPLOADED)
  async handleMediaUploaded(payload: { mediaId: string }) {
    // MediaService's upload event carries only `mediaId` (see
    // `media.service.ts`) — no `siteId`, since today's single-site
    // setup makes it redundant at the point that event is emitted.
    // Same "one known site" assumption `SiteService.getDefaultSiteId()`
    // already documents, so resolving it here rather than widening
    // `MediaService`'s event payload for a value it doesn't otherwise need.
    await this.auditLog.record({
      siteId: this.siteService.getDefaultSiteId(),
      action: 'media_uploaded',
      entityType: 'media',
      entityId: payload.mediaId,
    });
  }

  @OnEvent(WEBSITE_EVENTS.SETTINGS_UPDATED)
  async handleSettingsUpdated(payload: SettingsUpdatedPayload) {
    await this.auditLog.record({
      siteId: payload.siteId,
      action: 'settings_updated',
      metadata: { group: payload.group },
    });
  }
}

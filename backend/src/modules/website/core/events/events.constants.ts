/**
 * Domain event names. Plain string constants + payload types — imported
 * directly, not DI-provided, since they carry no behavior.
 */
import { PublishStatus } from '../publishing/publish-status.enum';

export const WEBSITE_EVENTS = {
  CONTENT_UPDATED: 'website.content.updated',
  CONTENT_PUBLISHED: 'website.content.published',
  MEDIA_UPLOADED: 'website.media.uploaded',
  SETTINGS_UPDATED: 'website.settings.updated',
} as const;

export interface ContentUpdatedPayload {
  entityType: string;
  entityId: string;
  siteId: string;
  /**
   * The status the entity transitioned to. Added for `AuditLogListener`
   * (`core/audit-log/audit-log.listener.ts`) so a "Recent Activity" row
   * can say "published"/"archived"/"draft" instead of just "updated" —
   * `PublishingService.transition()` already has this value on hand
   * (it's the `to` param), so populating it there is the only change;
   * none of `transition()`'s 13 call sites need to change.
   */
  status: PublishStatus;
}

export interface ContentPublishedPayload extends ContentUpdatedPayload {
  publishedAt: Date;
}

export interface SettingsUpdatedPayload {
  siteId: string;
  group: string;
}

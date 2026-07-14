/**
 * Domain event names. Plain string constants + payload types — imported
 * directly, not DI-provided, since they carry no behavior.
 */
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
}

export interface ContentPublishedPayload extends ContentUpdatedPayload {
  publishedAt: Date;
}

export interface SettingsUpdatedPayload {
  siteId: string;
  group: string;
}

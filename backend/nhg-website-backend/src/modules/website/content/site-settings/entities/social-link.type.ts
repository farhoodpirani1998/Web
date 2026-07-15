/**
 * Which networks the Social section can link out to. A fixed, small
 * set — same philosophy as `MenuItemLinkType`/`PageTemplate`: extend
 * only when the frontend actually gains a new network to render an
 * icon for, not preemptively. Facebook/Twitter are included alongside
 * the networks actually reachable in Iran (Instagram, Telegram,
 * WhatsApp, Eitaa) since some sites still mirror content there even
 * where the network itself is filtered.
 */
export enum SocialPlatform {
  INSTAGRAM = 'instagram',
  TELEGRAM = 'telegram',
  WHATSAPP = 'whatsapp',
  EITAA = 'eitaa',
  YOUTUBE = 'youtube',
  LINKEDIN = 'linkedin',
  TWITTER = 'twitter',
  FACEBOOK = 'facebook',
}

/**
 * One entry in `SiteSettings.socialLinks`. Stored as a plain jsonb
 * array on the settings row rather than its own table — same
 * reasoning as `Translatable<T>` jsonb columns elsewhere: this is a
 * small, always-loaded-with-its-parent shape, not something ever
 * queried or paginated on its own (unlike PortalLink, which gets its
 * own entity because it's independently ordered/toggled).
 */
export interface SocialLink {
  platform: SocialPlatform;
  url: string;
}

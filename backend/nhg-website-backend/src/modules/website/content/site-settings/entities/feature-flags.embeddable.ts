import { Column } from 'typeorm';

/**
 * Site-wide on/off switches for the optional public sections. A fixed,
 * named set of booleans — deliberately not a dynamic key/value flag
 * store, same philosophy as `ROLE_PERMISSIONS` (a small fixed map, not
 * a generic permission-management UI): building a generic flag engine
 * here would be speculative complexity ahead of an actual need for
 * one. Extend only when a new optional section actually ships.
 *
 * Only the modules that are genuinely optional/supplementary get a
 * flag here — Hero, About, Static Pages, and Navigation are core to
 * every site and are not gateable.
 */
export class SiteFeatureFlags {
  @Column({ default: true })
  newsEnabled!: boolean;

  @Column({ default: true })
  galleryEnabled!: boolean;

  @Column({ default: true })
  testimonialsEnabled!: boolean;

  @Column({ default: true })
  faqEnabled!: boolean;
}

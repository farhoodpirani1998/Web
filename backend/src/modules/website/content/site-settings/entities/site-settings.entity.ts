import { Entity, Column, Unique } from 'typeorm';
import { BaseSiteScopedEntity } from '../../../core/common/base-site-scoped.entity';
import { Translatable } from '../../../core/i18n/locale.enum';
import { SeoMetadata } from '../../../core/seo/seo-metadata.embeddable';
import { SiteFeatureFlags } from './feature-flags.embeddable';
import { SocialLink } from './social-link.type';

/**
 * Site Settings is a singleton per site (one row, unique siteId) —
 * same shape as AboutPage, auto-seeded on startup rather than exposing
 * create/delete endpoints for something that always exists exactly
 * once. Grouped here into General/Contact/Social/SEO/Feature Flags
 * sections (each with its own PATCH endpoint on SiteSettingsController)
 * purely for the admin UI's benefit — all five sections live on one
 * row, not five tables, since none of them is independently listed,
 * paginated, or ordered.
 *
 * Portal Links is the one part of this feature that is NOT on this
 * row: it's an ordered list (see PortalLink), so it gets its own
 * entity/service/controller, same reasoning as Feature/Testimonial —
 * consistent with this codebase's convention of a flat row for
 * singleton settings and a separate table for anything list-shaped.
 *
 * Deliberately NOT publish-status or revision tracked: unlike
 * About/Hero/News/Static Pages, there is no draft/published lifecycle
 * for site settings (they take effect immediately), and reverting a
 * settings field is trivial to just retype — same reasoning
 * RevisionsService already uses to exclude Feature/Faq/Testimonial.
 */
@Entity('site_settings')
@Unique(['siteId'])
export class SiteSettings extends BaseSiteScopedEntity {
  // --- General ---
  @Column({ type: 'jsonb' })
  siteName!: Translatable<string>;

  @Column({ type: 'jsonb', nullable: true })
  tagline?: Translatable<string>;

  // Reference into core/media, tracked via MediaUsage — same pattern
  // as AboutPage.imageMediaId, just two fields instead of one.
  @Column({ type: 'uuid', nullable: true })
  logoMediaId?: string;

  @Column({ type: 'uuid', nullable: true })
  faviconMediaId?: string;

  // --- Contact ---
  @Column({ nullable: true })
  contactEmail?: string;

  @Column({ nullable: true })
  contactPhone?: string;

  @Column({ type: 'jsonb', nullable: true })
  address?: Translatable<string>;

  // Arbitrary absolute URL (a Google Maps embed/share link) — plain
  // string rather than @IsUrl-validated at the DTO layer, same
  // reasoning as MenuItem.url.
  @Column({ nullable: true })
  mapUrl?: string;

  // --- Social ---
  @Column({ type: 'jsonb', default: [] })
  socialLinks!: SocialLink[];

  // --- SEO ---
  // Site-wide default/fallback metadata — used by the public-api layer
  // when a given page hasn't filled in its own SeoMetadata, not a page
  // in its own right, so (unlike AboutPage) this never registers with
  // SitemapService.
  @Column(() => SeoMetadata)
  defaultSeo!: SeoMetadata;

  // --- Feature Flags ---
  @Column(() => SiteFeatureFlags)
  featureFlags!: SiteFeatureFlags;
}

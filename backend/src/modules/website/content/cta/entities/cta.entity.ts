import { Entity, Column, Unique } from 'typeorm';
import { BaseSiteScopedEntity } from '../../../core/common/base-site-scoped.entity';
import { PublishStatus } from '../../../core/publishing/publish-status.enum';
import { Translatable } from '../../../core/i18n/locale.enum';

/**
 * The site-wide "Call to Action" banner (e.g. "Ready to enroll? [Apply
 * Now]"), typically shown near the bottom of the homepage. Deliberately
 * a singleton per site (one row, unique siteId) — same shape as
 * AboutPage/SiteSettings — rather than a list: a site has exactly one
 * CTA banner to configure, not a rotating set (that's what Hero is
 * for).
 *
 * Optional/supplementary section, unlike About/Hero: gated by
 * SiteFeatureFlags.ctaEnabled (see that embeddable's doc comment)
 * since not every site needs a bottom-of-page pitch banner.
 *
 * Not one of the revision-enabled types (see core/revisions): every
 * field here is short and trivial to retype — same reasoning
 * Feature/Testimonial/Faq/Statistic already establish — there is no
 * long-form prose worth diffing/restoring. Not its own indexable
 * public page either (no SeoMetadata, never registers with
 * SitemapService) — it's a component embedded on other pages, same
 * reasoning HeroSlide carries no SEO of its own.
 */
@Entity('cta_banner')
@Unique(['siteId'])
export class CtaBanner extends BaseSiteScopedEntity {
  @Column({ type: 'jsonb' })
  title!: Translatable<string>;

  @Column({ type: 'jsonb', nullable: true })
  description?: Translatable<string>;

  @Column({ type: 'jsonb' })
  primaryButtonLabel!: Translatable<string>;

  // Plain string, not @IsUrl — CTAs commonly link to internal relative
  // paths, same reasoning HeroSlide.ctaUrl/MenuItem.url/SiteSettings.mapUrl
  // already give.
  @Column()
  primaryButtonUrl!: string;

  // Secondary button is entirely optional (e.g. "Learn More" alongside
  // "Apply Now") — label and url travel together, both undefined or
  // both set, enforced at the service layer.
  @Column({ type: 'jsonb', nullable: true })
  secondaryButtonLabel?: Translatable<string>;

  @Column({ nullable: true })
  secondaryButtonUrl?: string;

  // Reference into core/media, tracked via MediaUsage — never an
  // embedded copy. Same pattern as AboutPage.imageMediaId.
  @Column({ type: 'uuid', nullable: true })
  backgroundImageMediaId?: string;

  @Column({ type: 'enum', enum: PublishStatus, default: PublishStatus.DRAFT })
  status!: PublishStatus;
}

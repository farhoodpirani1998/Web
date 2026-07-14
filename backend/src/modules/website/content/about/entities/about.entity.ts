import { Entity, Column, Unique } from 'typeorm';
import { BaseSiteScopedEntity } from '../../../core/common/base-site-scoped.entity';
import { PublishStatus } from '../../../core/publishing/publish-status.enum';
import { Translatable } from '../../../core/i18n/locale.enum';
import { SeoMetadata } from '../../../core/seo/seo-metadata.embeddable';

/**
 * The "About Us" page. Deliberately a singleton per site (one row,
 * unique siteId) rather than a list — distinct from the generic
 * Static Pages module (Phase 2+), which handles arbitrary additional
 * pages. Unlike Hero/FAQ/Testimonials, About IS its own indexable
 * public page, so it carries SeoMetadata and registers with
 * SitemapService. One of the 4 revision-enabled types.
 */
@Entity('about_page')
@Unique(['siteId'])
export class AboutPage extends BaseSiteScopedEntity {
  @Column({ type: 'jsonb' })
  title!: Translatable<string>;

  @Column({ type: 'jsonb' })
  body!: Translatable<string>;

  // Reference into core/media, tracked via MediaUsage.
  @Column({ type: 'uuid', nullable: true })
  imageMediaId?: string;

  @Column(() => SeoMetadata)
  seo!: SeoMetadata;

  @Column({ type: 'enum', enum: PublishStatus, default: PublishStatus.DRAFT })
  status!: PublishStatus;
}

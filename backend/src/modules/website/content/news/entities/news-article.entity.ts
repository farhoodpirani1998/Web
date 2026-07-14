import { Entity, Column, Index } from 'typeorm';
import { BaseSiteScopedEntity } from '../../../core/common/base-site-scoped.entity';
import { PublishStatus } from '../../../core/publishing/publish-status.enum';
import { Translatable } from '../../../core/i18n/locale.enum';
import { SeoMetadata } from '../../../core/seo/seo-metadata.embeddable';

/**
 * A single news/announcement article. The richest content type so far:
 * - One of the 4 revision-enabled types (see core/revisions) — long-form
 *   prose, high cost to accidentally lose, worth diffing/restoring.
 * - Carries SeoMetadata and registers with SitemapService, like About —
 *   News IS its own indexable public page (`/news/:slug`), unlike
 *   Hero/FAQ/Testimonials which only ever render inside another page.
 * - No `position`/no OrderingModule: unlike the curated carousels/lists
 *   (Hero, FAQ, Testimonials, Features, Gallery), a news feed's natural
 *   order is reverse-chronological (`publishAt`/`createdAt`), not a
 *   manually dragged sequence. Deliberately omitted rather than adding
 *   dead weight nothing will ever call.
 */
@Entity('news_articles')
@Index(['siteId', 'slug'], { unique: true })
export class NewsArticle extends BaseSiteScopedEntity {
  @Column({ type: 'jsonb' })
  title!: Translatable<string>;

  // Editor-supplied, not auto-derived from title — the default locale
  // is Farsi (see core/i18n), and transliterating Farsi into a clean
  // ASCII slug is a real feature in its own right, not something to
  // improvise here. Validated for shape and per-site uniqueness in
  // NewsService; unique index above is the DB-level backstop.
  @Column()
  slug!: string;

  // Short summary for listings/cards and as an SEO description
  // fallback — optional since not every article needs one distinct
  // from its opening paragraph.
  @Column({ type: 'jsonb', nullable: true })
  excerpt?: Translatable<string>;

  @Column({ type: 'jsonb' })
  body!: Translatable<string>;

  // Plain slug-like grouping — deliberately not its own entity/table,
  // same reasoning as Faq.category/GalleryItem.category. Promote to a
  // real Category relation only if the admin UI ever needs to manage
  // categories independently (rename across articles atomically, etc.).
  @Index()
  @Column({ nullable: true })
  category?: string;

  // Native Postgres text array — the first content module needing a
  // genuine multi-value field, so introduced here rather than forcing
  // FAQ/Testimonials' single `category` string convention onto it.
  @Column({ type: 'text', array: true, nullable: true })
  tags?: string[];

  // Reference into core/media, tracked via MediaUsage — never an
  // embedded copy. Optional, same as Hero.backgroundMediaId.
  @Column({ type: 'uuid', nullable: true })
  featuredImageMediaId?: string;

  @Column(() => SeoMetadata)
  seo!: SeoMetadata;

  // Scheduled publish time, independent of `status`. An article can be
  // flipped to PUBLISHED ahead of time with a future publishAt; the
  // public API / sitemap (see NewsService.onModuleInit) withholds it
  // until that moment passes. Deliberately not modeled as a new
  // PublishStatus value — this backend has no scheduler/cron kernel
  // piece to flip status automatically, and gating visibility at read
  // time needs none.
  @Column({ type: 'timestamptz', nullable: true })
  publishAt?: Date;

  @Column({ type: 'enum', enum: PublishStatus, default: PublishStatus.DRAFT })
  status!: PublishStatus;
}

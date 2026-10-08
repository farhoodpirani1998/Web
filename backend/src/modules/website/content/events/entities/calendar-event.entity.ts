import { Entity, Column, Index } from 'typeorm';
import { BaseSiteScopedEntity } from '../../../core/common/base-site-scoped.entity';
import { PublishStatus } from '../../../core/publishing/publish-status.enum';
import { Translatable } from '../../../core/i18n/locale.enum';
import { SeoMetadata } from '../../../core/seo/seo-metadata.embeddable';

/**
 * A single calendar event (open house, fundraiser, graduation, etc.).
 * Modeled directly on News/Pages, with the same "indexable public page"
 * shape (slug, SeoMetadata, SitemapService registration, publishAt
 * scheduling, revision history) plus the handful of fields an event
 * actually needs beyond an article: `startAt`/`endAt`/`allDay` for
 * when it happens, `location`/`locationUrl` for where.
 *
 * - One of the revision-enabled types (see core/revisions) — like
 *   News/Pages, `body` is long-form prose worth diffing/restoring, not
 *   structural/list content (Hero/FAQ/Testimonials/Gallery/Features).
 * - Carries SeoMetadata and registers with SitemapService — an Event
 *   IS its own indexable public page (`/events/:slug`), same as
 *   News/Pages/About.
 * - `publishAt` (from News/Pages) and `startAt` are deliberately
 *   distinct: `publishAt` gates when the *listing itself* becomes
 *   visible (e.g. announce two weeks early), `startAt` is simply when
 *   the event happens. Conflating them would make it impossible to
 *   publish an event ahead of its date, which is the normal case.
 * - No `position`/no OrderingModule: like a news feed, an events list
 *   has a natural order — chronological by `startAt` — not a manually
 *   dragged sequence. Deliberately omitted rather than adding dead
 *   weight nothing will ever call.
 */
@Entity('calendar_events')
@Index(['siteId', 'slug'], { unique: true })
export class CalendarEvent extends BaseSiteScopedEntity {
  @Column({ type: 'jsonb' })
  title!: Translatable<string>;

  // Editor-supplied, not auto-derived from title — same reasoning as
  // News.slug/StaticPage.slug. Validated for shape and per-site
  // uniqueness in EventsService; unique index above is the DB-level
  // backstop.
  @Column()
  slug!: string;

  // Short summary for listings/cards and as an SEO description
  // fallback — optional, same as News.excerpt.
  @Column({ type: 'jsonb', nullable: true })
  excerpt?: Translatable<string>;

  @Column({ type: 'jsonb' })
  body!: Translatable<string>;

  // Plain slug-like grouping (e.g. "open-house", "fundraiser",
  // "sports") — deliberately not its own entity/table, same reasoning
  // as News.category.
  @Index()
  @Column({ nullable: true })
  category?: string;

  @Column({ type: 'text', array: true, nullable: true })
  tags?: string[];

  // Free-text venue/address, translatable like any other editor-authored
  // prose field on this entity.
  @Column({ type: 'jsonb', nullable: true })
  location?: Translatable<string>;

  // Arbitrary absolute URL (a Google Maps embed/share link) — plain
  // string rather than @IsUrl-validated at the DTO layer, same
  // reasoning as SiteSettings.mapUrl/MenuItem.url.
  @Column({ nullable: true })
  locationUrl?: string;

  // When the event happens. Required — an event without a start time
  // isn't a meaningful row (unlike News, which has no equivalent
  // concept). Indexed since it's the primary sort/filter key for both
  // admin and public listings.
  @Index()
  @Column({ type: 'timestamptz' })
  startAt!: Date;

  // Optional — many events are a single point in time, not a span.
  // Validity (must be after startAt, when present) is enforced in
  // EventsService, not at the DB layer, same convention as
  // StaticPage.parentId's cycle check.
  @Column({ type: 'timestamptz', nullable: true })
  endAt?: Date;

  // Whether startAt/endAt should be treated as calendar dates rather
  // than specific times — a display concern for the frontend, not
  // something this backend otherwise interprets.
  @Column({ default: false })
  allDay!: boolean;

  // Reference into core/media, tracked via MediaUsage — never an
  // embedded copy. Optional, same as News.featuredImageMediaId.
  @Column({ type: 'uuid', nullable: true })
  featuredImageMediaId?: string;

  @Column(() => SeoMetadata)
  seo!: SeoMetadata;

  // Scheduled publish time, independent of `status` — identical idiom
  // to News/Pages; see EventsService.onModuleInit for how it gates
  // sitemap visibility.
  @Column({ type: 'timestamptz', nullable: true })
  publishAt?: Date;

  @Column({ type: 'enum', enum: PublishStatus, default: PublishStatus.DRAFT })
  status!: PublishStatus;
}

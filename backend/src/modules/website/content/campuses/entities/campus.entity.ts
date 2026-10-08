import { Entity, Column, Index } from 'typeorm';
import { BaseSiteScopedEntity } from '../../../core/common/base-site-scoped.entity';
import { PublishStatus } from '../../../core/publishing/publish-status.enum';
import { Translatable } from '../../../core/i18n/locale.enum';
import { SeoMetadata } from '../../../core/seo/seo-metadata.embeddable';

/**
 * A single physical campus/branch (e.g. "Downtown Campus", "North
 * Campus"). Modeled on News/Events/Pages' "indexable public page"
 * shape (slug, SeoMetadata, SitemapService registration, publishAt
 * scheduling, revision history) plus the handful of fields a campus
 * actually needs beyond an article: `address`/`mapUrl` for where it
 * is, `phone`/`email` for how to reach it — the same three-field
 * contact shape SiteSettings already uses for the site's own contact
 * info (SiteSettings.address/mapUrl/contactPhone/contactEmail), just
 * scoped to one campus instead of the whole site.
 *
 * - One of the revision-enabled types (see core/revisions) — like
 *   News/Events/Pages, `body` is long-form prose worth diffing/
 *   restoring, not structural/list content (Hero/FAQ/Testimonials/
 *   Gallery/Features).
 * - Carries SeoMetadata and registers with SitemapService — a Campus
 *   IS its own indexable public page (`/campuses/:slug`), same as
 *   News/Events/Pages/About.
 * - Core content, not feature-flag gated — same reasoning
 *   SiteFeatureFlags' doc comment gives for Hero/About/Static Pages/
 *   Navigation: a school group's list of physical campuses isn't an
 *   optional marketing widget the way Testimonials/Gallery/FAQ/News/
 *   Events are, so there is deliberately no `campusesEnabled` flag.
 * - Unlike News (reverse-chronological) and Events (chronological by
 *   startAt), a campus list has no natural order of its own — it's a
 *   small, curated set an editor will want to sequence deliberately
 *   (e.g. the main campus listed first). `position` + OrderingModule
 *   is used here for that reason, the same idiom Features/
 *   Testimonials/Gallery already use, layered on top of the
 *   News/Events "own public page" shape rather than instead of it.
 */
@Entity('campuses')
@Index(['siteId', 'slug'], { unique: true })
export class Campus extends BaseSiteScopedEntity {
  @Column({ type: 'jsonb' })
  title!: Translatable<string>;

  // Editor-supplied, not auto-derived from title — same reasoning as
  // News.slug/StaticPage.slug. Validated for shape and per-site
  // uniqueness in CampusesService; unique index above is the DB-level
  // backstop.
  @Column()
  slug!: string;

  // Short summary for listings/cards and as an SEO description
  // fallback — optional, same as News.excerpt.
  @Column({ type: 'jsonb', nullable: true })
  excerpt?: Translatable<string>;

  @Column({ type: 'jsonb' })
  body!: Translatable<string>;

  // Physical address — translatable prose field, same reasoning as
  // SiteSettings.address.
  @Column({ type: 'jsonb', nullable: true })
  address?: Translatable<string>;

  // A Google Maps embed/share link — same convention as
  // SiteSettings.mapUrl.
  @Column({ nullable: true })
  mapUrl?: string;

  // Campus-specific contact details, independent of SiteSettings'
  // site-wide contactPhone/contactEmail — a visitor calling "the
  // Downtown Campus" needs that campus's own number, not the
  // switchboard.
  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  email?: string;

  // Manual admin ordering — see class comment. Indexed since it's the
  // primary sort key for both admin and public listings.
  @Index()
  @Column({ type: 'int', default: 0 })
  position!: number;

  // Reference into core/media, tracked via MediaUsage — never an
  // embedded copy. Optional, same as News.featuredImageMediaId.
  @Column({ type: 'uuid', nullable: true })
  featuredImageMediaId?: string;

  @Column(() => SeoMetadata)
  seo!: SeoMetadata;

  // Scheduled publish time, independent of `status` — identical idiom
  // to News/Events/Pages; see CampusesService.onModuleInit for how it
  // gates sitemap visibility.
  @Column({ type: 'timestamptz', nullable: true })
  publishAt?: Date;

  @Column({ type: 'enum', enum: PublishStatus, default: PublishStatus.DRAFT })
  status!: PublishStatus;
}

import { Entity, Column, Index } from 'typeorm';
import { BaseSiteScopedEntity } from '../../../core/common/base-site-scoped.entity';
import { PublishStatus } from '../../../core/publishing/publish-status.enum';
import { Translatable } from '../../../core/i18n/locale.enum';
import { SeoMetadata } from '../../../core/seo/seo-metadata.embeddable';
import { PageTemplate } from './page-template.enum';

/**
 * A generic, arbitrary content page (admissions policy, campus life,
 * a landing page, etc.) — the Phase 2+ "Static Pages" module the About
 * entity's doc comment points to. Unlike About (a fixed singleton),
 * there can be any number of these, each with its own slug.
 *
 * - One of the 4 revision-enabled types (`static_page` — already
 *   reserved in RevisionsService.REVISION_ENABLED_TYPES).
 * - Carries SeoMetadata and registers with SitemapService — a Page IS
 *   its own indexable public route, same as About/News.
 * - `parentId` is a plain uuid reference (like `featuredImageMediaId`),
 *   not a TypeORM relation/FK — consistent with this codebase's existing
 *   convention of loose, service-validated references rather than
 *   relational cascades. Hierarchy here is for admin organization (and
 *   is available to the frontend for nav/breadcrumbs); it deliberately
 *   does NOT change a page's own URL (see PagesService sitemap
 *   provider) — nested public URLs are a frontend-routing concern, not
 *   something introduced speculatively here.
 * - No `position`/OrderingModule, same reasoning as News: pages aren't
 *   a manually-dragged sequence. (Ordering children under a parent, if
 *   ever needed, is future scope — not requested here.)
 */
@Entity('static_pages')
@Index(['siteId', 'slug'], { unique: true })
export class StaticPage extends BaseSiteScopedEntity {
  @Column({ type: 'jsonb' })
  title!: Translatable<string>;

  // Editor-supplied, not auto-derived — same reasoning as News.slug.
  // Validated for shape and per-site uniqueness in PagesService; unique
  // index above is the DB-level backstop.
  @Column()
  slug!: string;

  @Column({ type: 'jsonb' })
  body!: Translatable<string>;

  @Column({ type: 'enum', enum: PageTemplate, default: PageTemplate.DEFAULT })
  template!: PageTemplate;

  // References another StaticPage row on the same site. Nullable — most
  // pages are top-level. Validity (exists, same site, no cycle) is
  // enforced in PagesService, not at the DB layer.
  @Index()
  @Column({ type: 'uuid', nullable: true })
  parentId?: string;

  // Whether this page should appear in site navigation. Independent of
  // `status` — a page can be PUBLISHED (reachable by direct link) but
  // deliberately left out of the menu.
  @Column({ default: true })
  showInMenu!: boolean;

  // At most one page per site should have this set — enforced in
  // PagesService.setHomepage (unsets any previous holder in the same
  // transaction), not as a DB constraint, since a plain unique index
  // can't express "unique only when true" without a partial index this
  // codebase doesn't otherwise use.
  @Column({ default: false })
  isHomepage!: boolean;

  // Reference into core/media, tracked via MediaUsage — never an
  // embedded copy. Optional, same as News.featuredImageMediaId.
  @Column({ type: 'uuid', nullable: true })
  featuredImageMediaId?: string;

  @Column(() => SeoMetadata)
  seo!: SeoMetadata;

  // Scheduled publish time, independent of `status` — identical idiom
  // to News.publishAt; see PagesService.onModuleInit for how it gates
  // sitemap visibility.
  @Column({ type: 'timestamptz', nullable: true })
  publishAt?: Date;

  @Column({ type: 'enum', enum: PublishStatus, default: PublishStatus.DRAFT })
  status!: PublishStatus;
}

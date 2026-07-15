import { Entity, Column, Index } from 'typeorm';
import { BaseSiteScopedEntity } from '../../../core/common/base-site-scoped.entity';
import { PublishStatus } from '../../../core/publishing/publish-status.enum';
import { Translatable } from '../../../core/i18n/locale.enum';
import { SeoMetadata } from '../../../core/seo/seo-metadata.embeddable';

/**
 * A single teacher/staff profile (e.g. "Ms. Smith — Mathematics
 * Teacher"). Modeled directly on Campus's "indexable public page" shape
 * (slug, SeoMetadata, SitemapService registration, publishAt scheduling,
 * revision history, manual `position` ordering via OrderingModule) —
 * see Campus's doc comment for the reasoning behind each of those. A
 * teacher profile is the same shape of thing: its own small, curated,
 * manually-ordered set of long-form public pages.
 *
 * What differs from Campus is only the handful of teacher-specific
 * fields:
 * - `fullName` is a proper noun, not translatable — same reasoning as
 *   Testimonial.authorName.
 * - `avatarMediaId` replaces `featuredImageMediaId` — same Media
 *   reference-only convention (core/media, tracked via MediaUsage),
 *   just named for what it actually is here (a headshot/avatar).
 * - `campusId` is an optional plain uuid reference to the Campus this
 *   teacher is based at — not a TypeORM relation/foreign key, consistent
 *   with every other cross-entity reference in this schema
 *   (featuredImageMediaId, avatarMediaId, siteId, ...); validated at the
 *   service layer, not the DB layer.
 *
 * - One of the revision-enabled types (see core/revisions) — `bio` is
 *   long-form prose worth diffing/restoring, not structural/list content
 *   (Testimonials/FAQ/Gallery/Features).
 * - Carries SeoMetadata and registers with SitemapService — a Teacher
 *   profile IS its own indexable public page (`/teachers/:slug`), same
 *   as Campus/News/Events/Pages.
 * - Core content, not feature-flag gated — a school's list of teachers
 *   isn't an optional marketing widget the way Testimonials/Gallery/FAQ/
 *   News/Events are, same reasoning Campus's doc comment gives.
 * - Unlike News/Events (chronological), a teacher directory has no
 *   natural order of its own — `position` + OrderingModule lets an
 *   editor sequence it deliberately (e.g. leadership first), same idiom
 *   as Campus/Features/Testimonials/Gallery.
 */
@Entity('teachers')
@Index(['siteId', 'slug'], { unique: true })
export class Teacher extends BaseSiteScopedEntity {
  // Proper noun — not translatable, same reasoning as
  // Testimonial.authorName.
  @Column()
  fullName!: string;

  // Editor-supplied, not auto-derived from fullName — same reasoning as
  // Campus.slug/News.slug. Validated for shape and per-site uniqueness
  // in TeachersService; unique index above is the DB-level backstop.
  @Column()
  slug!: string;

  // e.g. "Mathematics Teacher", "Head of Science Department" — prose,
  // so translatable, unlike fullName above.
  @Column({ type: 'jsonb' })
  jobTitle!: Translatable<string>;

  // Short summary for listings/cards and as an SEO description
  // fallback — optional, same as Campus.excerpt/News.excerpt.
  @Column({ type: 'jsonb', nullable: true })
  excerpt?: Translatable<string>;

  // Long-form profile prose — the field that makes this a
  // revision-enabled type, same reasoning as Campus.body.
  @Column({ type: 'jsonb' })
  bio!: Translatable<string>;

  // Subject/department taught, e.g. "Mathematics" — optional, translatable
  // prose (a subject name may itself need translation), independent of
  // `jobTitle` (a teacher's title vs. what they teach are not always
  // the same string, e.g. "Head of Department — Mathematics").
  @Column({ type: 'jsonb', nullable: true })
  department?: Translatable<string>;

  // Optional reference to the Campus this teacher is based at — plain
  // uuid, not a relation; see class comment.
  @Column({ type: 'uuid', nullable: true })
  campusId?: string;

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
  // embedded copy. Optional, same convention as Campus.featuredImageMediaId,
  // just named for what it is here (headshot/avatar).
  @Column({ type: 'uuid', nullable: true })
  avatarMediaId?: string;

  @Column(() => SeoMetadata)
  seo!: SeoMetadata;

  // Scheduled publish time, independent of `status` — identical idiom
  // to Campus/News/Events/Pages; see TeachersService.onModuleInit for
  // how it gates sitemap/public visibility.
  @Column({ type: 'timestamptz', nullable: true })
  publishAt?: Date;

  @Column({ type: 'enum', enum: PublishStatus, default: PublishStatus.DRAFT })
  status!: PublishStatus;
}

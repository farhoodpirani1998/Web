import { Entity, Column, Index } from 'typeorm';
import { BaseSiteScopedEntity } from '../../../core/common/base-site-scoped.entity';
import { PublishStatus } from '../../../core/publishing/publish-status.enum';
import { Translatable } from '../../../core/i18n/locale.enum';

/**
 * A single photo in the public gallery (campus life, events, etc.).
 * Structural/list content, like Testimonials — not one of the 4
 * revision-enabled types, since there's no prose worth diffing across
 * versions. Unlike FAQ, it does reference Media (the photo itself is
 * the whole point), tracked via MediaUsage exactly like Testimonial's
 * avatar — reference only, never an embedded copy.
 */
@Entity('gallery_items')
export class GalleryItem extends BaseSiteScopedEntity {
  // Reference only, per the Media convention (core/media). Required —
  // unlike Testimonial's optional avatar, a gallery item without an
  // image isn't a meaningful row.
  @Column({ type: 'uuid' })
  imageMediaId!: string;

  // Optional caption/alt copy shown under the photo — prose, so
  // translatable, unlike the plain-string `category` below.
  @Column({ type: 'jsonb', nullable: true })
  caption?: Translatable<string>;

  // Plain slug-like grouping (e.g. "campus", "events", "sports") for
  // client-side filtering — deliberately not its own entity/table,
  // same reasoning as Faq.category.
  @Index()
  @Column({ nullable: true })
  category?: string;

  @Index()
  @Column({ type: 'int', default: 0 })
  position!: number;

  @Column({ type: 'enum', enum: PublishStatus, default: PublishStatus.DRAFT })
  status!: PublishStatus;
}

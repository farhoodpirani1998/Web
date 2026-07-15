import { Entity, Column, Index } from 'typeorm';
import { BaseSiteScopedEntity } from '../../../core/common/base-site-scoped.entity';
import { PublishStatus } from '../../../core/publishing/publish-status.enum';
import { Translatable } from '../../../core/i18n/locale.enum';

/**
 * A single "why choose us" style card (e.g. "Bilingual curriculum",
 * "Small class sizes") for the public features/highlights section.
 * Structural/list content, like FAQ and Testimonials — not one of the
 * 4 revision-enabled types, and no Media reference: `icon` is a design
 * token (an icon-library key such as a Lucide icon name), not an
 * uploaded asset, so it's a plain string rather than a Media relation.
 */
@Entity('features')
export class Feature extends BaseSiteScopedEntity {
  @Column({ type: 'jsonb' })
  title!: Translatable<string>;

  @Column({ type: 'jsonb' })
  description!: Translatable<string>;

  // Icon-library key (e.g. "graduation-cap") resolved client-side —
  // deliberately not a Media reference, see class comment.
  @Column({ nullable: true })
  icon?: string;

  @Index()
  @Column({ type: 'int', default: 0 })
  position!: number;

  @Column({ type: 'enum', enum: PublishStatus, default: PublishStatus.DRAFT })
  status!: PublishStatus;
}

import { Entity, Column, Index } from 'typeorm';
import { BaseSiteScopedEntity } from '../../../core/common/base-site-scoped.entity';
import { PublishStatus } from '../../../core/publishing/publish-status.enum';
import { Translatable } from '../../../core/i18n/locale.enum';

/**
 * One slide in the homepage hero/banner carousel. A list, not a
 * singleton — a site can rotate several slides, ordered by `position`
 * like FAQ/Testimonials. One of the 4 revision-enabled types (see
 * core/revisions), since a hero slide is high-visibility, easy-to-
 * regret-editing homepage content worth being able to roll back.
 */
@Entity('hero_slides')
export class HeroSlide extends BaseSiteScopedEntity {
  @Column({ type: 'jsonb' })
  heading!: Translatable<string>;

  @Column({ type: 'jsonb', nullable: true })
  subheading?: Translatable<string>;

  @Column({ type: 'jsonb', nullable: true })
  ctaLabel?: Translatable<string>;

  @Column({ nullable: true })
  ctaUrl?: string;

  // Reference into core/media, tracked via MediaUsage — never an
  // embedded copy.
  @Column({ type: 'uuid', nullable: true })
  backgroundMediaId?: string;

  @Index()
  @Column({ type: 'int', default: 0 })
  position!: number;

  @Column({ type: 'enum', enum: PublishStatus, default: PublishStatus.DRAFT })
  status!: PublishStatus;
}

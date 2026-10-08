import { Entity, Column, Index } from 'typeorm';
import { BaseSiteScopedEntity } from '../../../core/common/base-site-scoped.entity';
import { PublishStatus } from '../../../core/publishing/publish-status.enum';
import { Translatable } from '../../../core/i18n/locale.enum';

/**
 * A single parent/student/staff quote for the public testimonials
 * carousel. Structural/list content, like FAQ — not revision-enabled.
 */
@Entity('testimonials')
export class Testimonial extends BaseSiteScopedEntity {
  // A proper noun — not translatable, unlike role and content below.
  @Column()
  authorName!: string;

  // e.g. "Parent of a Grade 4 student" — translatable since it's prose,
  // optional since a plain quote with no attribution role is valid.
  @Column({ type: 'jsonb', nullable: true })
  authorRole?: Translatable<string>;

  @Column({ type: 'jsonb' })
  content!: Translatable<string>;

  // 1-5, optional — not every testimonial carries a star rating.
  @Column({ type: 'int', nullable: true })
  rating?: number;

  // Reference only, per the Media convention (core/media) — never an
  // embedded copy. Attach/detach usage tracking happens in the service,
  // same as any other content module that references Media.
  @Column({ type: 'uuid', nullable: true })
  avatarMediaId?: string;

  @Index()
  @Column({ type: 'int', default: 0 })
  position!: number;

  @Column({ type: 'enum', enum: PublishStatus, default: PublishStatus.DRAFT })
  status!: PublishStatus;
}

import { Entity, Column, Index } from 'typeorm';
import { BaseSiteScopedEntity } from '../../../core/common/base-site-scoped.entity';
import { PublishStatus } from '../../../core/publishing/publish-status.enum';
import { Translatable } from '../../../core/i18n/locale.enum';

/**
 * A single question/answer pair for the public FAQ list. Structural/list
 * content, like Testimonials — not one of the 4 revision-enabled types
 * (hero, about, news_article, static_page), since reverting a short
 * Q&A is trivial to just retype rather than needing version history.
 */
@Entity('faqs')
export class Faq extends BaseSiteScopedEntity {
  @Column({ type: 'jsonb' })
  question!: Translatable<string>;

  @Column({ type: 'jsonb' })
  answer!: Translatable<string>;

  // Plain slug-like grouping (e.g. "admissions", "fees") — deliberately
  // not its own entity/table. Promote to a real Category relation only
  // if the admin UI ever needs to manage categories independently
  // (reorder them, rename across FAQs atomically, etc.).
  @Column({ nullable: true })
  category?: string;

  @Index()
  @Column({ type: 'int', default: 0 })
  position!: number;

  @Column({ type: 'enum', enum: PublishStatus, default: PublishStatus.DRAFT })
  status!: PublishStatus;
}

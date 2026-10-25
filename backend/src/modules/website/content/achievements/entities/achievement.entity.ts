import { Entity, Column, Index } from 'typeorm';
import { BaseSiteScopedEntity } from '../../../core/common/base-site-scoped.entity';
import { PublishStatus } from '../../../core/publishing/publish-status.enum';
import { Translatable } from '../../../core/i18n/locale.enum';

/**
 * A single figure in the homepage "Achievements" band (e.g. a headline
 * stat like "۱۵+ رتبه‌ی برتر کشوری"). Structural/list content, the same
 * shape family as FAQ/Testimonials — not revision-enabled (retyping one
 * line is cheaper than version history), no media, no SEO (it only ever
 * renders inside the homepage band, never its own page).
 *
 * `value` is a plain string, not a number: the band's figures are
 * already-formatted display values ("۱۵+", "۹۵٪") that don't share a
 * unit or suffix convention the way Statistics' numeric `value`+`suffix`
 * do. Storing the display string verbatim keeps the editor in full
 * control of exactly what shows.
 */
@Entity('achievements')
export class Achievement extends BaseSiteScopedEntity {
  @Column()
  value!: string;

  @Column({ type: 'jsonb' })
  label!: Translatable<string>;

  // Optional lucide icon name, same convention as Feature.icon.
  @Column({ nullable: true })
  icon?: string;

  @Index()
  @Column({ type: 'int', default: 0 })
  position!: number;

  @Column({ type: 'enum', enum: PublishStatus, default: PublishStatus.DRAFT })
  status!: PublishStatus;
}

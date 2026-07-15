import { Entity, Column, Index } from 'typeorm';
import { BaseSiteScopedEntity } from '../../../core/common/base-site-scoped.entity';
import { PublishStatus } from '../../../core/publishing/publish-status.enum';
import { Translatable } from '../../../core/i18n/locale.enum';

/**
 * A single "by the numbers" stat counter (e.g. "500+ Graduates",
 * "20 Years of Experience") for the public statistics/counters section.
 * Structural/list content, same category as Feature/Testimonial/Faq —
 * not one of the revision-enabled types (see core/revisions): every
 * field here is short and trivial to retype, there is no long-form
 * prose worth diffing/restoring. No Media reference either, same
 * reasoning as Feature.icon: `icon` is a design token (an icon-library
 * key), not an uploaded asset.
 *
 * `value`/`suffix` are split rather than a single formatted string
 * (e.g. "500+") so the public site can animate/count up the numeric
 * part client-side while still rendering an arbitrary trailing label
 * like "+", "%", or "K" next to it.
 */
@Entity('statistics')
export class Statistic extends BaseSiteScopedEntity {
  // e.g. "Graduates", "Years of Experience" — prose, so translatable.
  @Column({ type: 'jsonb' })
  label!: Translatable<string>;

  // The numeric part a counter animates towards, e.g. 500 or 98.5.
  // `float` rather than `int` since some stats are naturally
  // fractional (e.g. a 98.5% satisfaction rate).
  @Column({ type: 'float' })
  value!: number;

  // Trailing unit/decoration rendered after the animated value, e.g.
  // "+", "%", "K" — optional, plain string like Feature.icon.
  @Column({ nullable: true })
  suffix?: string;

  // Icon-library key (e.g. "graduation-cap") resolved client-side —
  // deliberately not a Media reference, same reasoning as Feature.icon.
  @Column({ nullable: true })
  icon?: string;

  // Manual admin ordering — indexed since it's the primary sort key for
  // both admin and public listings. Same idiom as Feature/Testimonial/
  // Campus.position.
  @Index()
  @Column({ type: 'int', default: 0 })
  position!: number;

  @Column({ type: 'enum', enum: PublishStatus, default: PublishStatus.DRAFT })
  status!: PublishStatus;
}

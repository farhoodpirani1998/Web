import { Entity, Column, Index } from 'typeorm';
import { BaseSiteScopedEntity } from '../../../core/common/base-site-scoped.entity';
import { PublishStatus } from '../../../core/publishing/publish-status.enum';
import { Translatable } from '../../../core/i18n/locale.enum';

/**
 * The kind of calendar entry — each maps to one section on the public
 * Academic Calendar page. A single table with a discriminator (rather
 * than one table per kind) because all five share the same shape family
 * (a title, an optional short value/date/range, an optional
 * description, and an admin order) — five near-identical tables would
 * be pure boilerplate.
 */
export enum AcademicCalendarEntryKind {
  YEAR_STAT = 'year_stat',
  TERM = 'term',
  HOLIDAY = 'holiday',
  EXAM_PERIOD = 'exam_period',
  IMPORTANT_DATE = 'important_date',
}

/**
 * A single Academic Calendar entry (Website Frontend Architecture §4,
 * §8). Structural/list content, like FAQ/Testimonials — not
 * revision-enabled, no media, no SEO (renders only inside the calendar
 * page, never its own route).
 *
 * Field roles by `kind`:
 * - `year_stat`  → `value` = the figure, `title` = its label
 * - `term`       → `value` = display order, `dateRange`, `description`
 * - `holiday`    → `date`, `description`, `title` = the holiday name
 * - `exam_period`→ `dateRange`, `description`
 * - `important_date` → `date`, `description`
 *
 * Dates are free-text Persian strings (e.g. "۱۴۰۴/۰۶/۱۵"), not typed
 * dates — the source content is human-formatted Persian dates and the
 * page renders them verbatim, so storing them as text keeps the editor
 * in full control of exactly what shows.
 */
@Entity('academic_calendar_entries')
export class AcademicCalendarEntry extends BaseSiteScopedEntity {
  @Index()
  @Column({ type: 'enum', enum: AcademicCalendarEntryKind })
  kind!: AcademicCalendarEntryKind;

  @Column({ type: 'jsonb' })
  title!: Translatable<string>;

  @Column({ nullable: true })
  value?: string;

  @Column({ nullable: true })
  dateRange?: string;

  @Column({ nullable: true })
  date?: string;

  @Column({ type: 'jsonb', nullable: true })
  description?: Translatable<string>;

  @Index()
  @Column({ type: 'int', default: 0 })
  position!: number;

  @Column({ type: 'enum', enum: PublishStatus, default: PublishStatus.DRAFT })
  status!: PublishStatus;
}

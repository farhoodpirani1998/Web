import { Entity, Column, Index } from 'typeorm';
import { BaseSiteScopedEntity } from '../../../core/common/base-site-scoped.entity';
import { PublishStatus } from '../../../core/publishing/publish-status.enum';
import { Translatable } from '../../../core/i18n/locale.enum';

/**
 * The kind of admissions entry — each maps to one section on the public
 * Admissions page. A single table with a discriminator, same reasoning
 * as `AcademicCalendarEntry`: `Requirement`/`RequiredDocument` are
 * structurally identical, `AdmissionStep` adds an order label, and
 * `TuitionPlan` adds price/period/includes — all one shape family.
 */
export enum AdmissionEntryKind {
  STEP = 'step',
  REQUIREMENT = 'requirement',
  REQUIRED_DOCUMENT = 'required_document',
  TUITION_PLAN = 'tuition_plan',
}

/**
 * A single Admissions entry (Website Frontend Architecture §4, §8).
 * Structural/list content — not revision-enabled, no media, no SEO.
 *
 * Field roles by `kind`:
 * - `step`             → `value` = display order, `description`
 * - `requirement`      → `description`
 * - `required_document`→ `description`
 * - `tuition_plan`     → `price`, `period`, `includes` (short labels)
 */
@Entity('admission_entries')
export class AdmissionEntry extends BaseSiteScopedEntity {
  @Index()
  @Column({ type: 'enum', enum: AdmissionEntryKind })
  kind!: AdmissionEntryKind;

  @Column({ type: 'jsonb' })
  title!: Translatable<string>;

  // Display order for `step` (Persian digit label, e.g. "۱").
  @Column({ nullable: true })
  value?: string;

  @Column({ type: 'jsonb', nullable: true })
  description?: Translatable<string>;

  // Tuition-plan fields.
  @Column({ nullable: true })
  price?: string;

  @Column({ nullable: true })
  period?: string;

  @Column({ type: 'text', array: true, nullable: true })
  includes?: string[];

  @Index()
  @Column({ type: 'int', default: 0 })
  position!: number;

  @Column({ type: 'enum', enum: PublishStatus, default: PublishStatus.DRAFT })
  status!: PublishStatus;
}

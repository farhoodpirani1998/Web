import { Entity, Column, Index } from 'typeorm';
import { BaseSiteScopedEntity } from '../../../core/common/base-site-scoped.entity';
import { PreRegistrationStatus } from './pre-registration-status.enum';

/**
 * A single public submission of the Pre-Registration form
 * (`frontend/src/features/pre-registration/RegistrationForm.tsx`).
 * Fields mirror that form's actual inputs exactly — no invented fields
 * (there is no "campus of interest" field on the form, only grade).
 *
 * Structural/list content like PortalLink, not one of the revision- or
 * publish-tracked types: a submission is either acted on (status) or
 * deleted, never drafted/published/reverted. No `position` either —
 * unlike PortalLink this isn't a manually-ordered list; the admin list
 * sorts by `createdAt` (see `PreRegistrationsService.findAll`).
 *
 * None of these fields are `Translatable` — this is visitor-submitted
 * data (a name, a phone number, free-text notes), not CMS-authored
 * multi-locale content, so plain columns throughout.
 *
 * `submittedAt` from the sprint's field list is deliberately not its
 * own column: `BaseSiteScopedEntity` -> `BaseEntity` already provides
 * `createdAt` (a `timestamptz`, set once at insert) which *is* the
 * submission time — adding a second, always-identical timestamp column
 * would just be duplicated data. The admin API/UI surface this same
 * value labeled "Submitted".
 */
@Entity('pre_registrations')
export class PreRegistration extends BaseSiteScopedEntity {
  @Column()
  studentFirstName!: string;

  @Column()
  studentLastName!: string;

  // کد ملی — national ID. Plain string (not numeric): may carry
  // formatting/leading zeros, same reasoning as not over-constraining
  // `guardianPhone` below.
  @Column()
  studentNationalId!: string;

  // Date-only (the form's <input type="date">), no time component.
  @Column({ type: 'date' })
  studentBirthDate!: string;

  // Matches one of RegistrationForm's fixed <option value="..."> keys
  // (e.g. "grade-1"). Plain string, not an enum: the option list is
  // frontend-owned UI copy today (see that file's own doc comment on
  // a future CMS-driven field configuration), so the backend shouldn't
  // hardcode a matching enum that would drift out of sync with it.
  @Column()
  studentGrade!: string;

  @Column()
  guardianFullName!: string;

  // Plain string, not @IsPhoneNumber-validated at the DTO layer —
  // same reasoning as PortalLink.url / MenuItem.url not over-validating
  // free-form contact input.
  @Column()
  guardianPhone!: string;

  @Column({ nullable: true })
  guardianEmail?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Index()
  @Column({ type: 'enum', enum: PreRegistrationStatus, default: PreRegistrationStatus.NEW })
  status!: PreRegistrationStatus;
}

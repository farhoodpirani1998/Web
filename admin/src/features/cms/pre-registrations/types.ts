/**
 * Types for the CMS Pre-Registrations module, mirroring the backend
 * `PreRegistration` entity and its DTOs
 * (`backend/src/modules/website/content/pre-registrations/entities/pre-registration.entity.ts`,
 * `.../pre-registrations/dto/update-pre-registration-status.dto.ts`).
 * Same "mirror, don't import" reasoning as every other module's
 * `types.ts` — the admin frontend and the NestJS backend are separate
 * packages with no shared runtime code path.
 *
 * `siteId` is deliberately not modeled here, same call every other
 * module's types file makes.
 *
 * No `studentGrade` union: mirrors the entity's own plain-string
 * column — the grade option list is frontend-owned UI copy on the
 * public site's `RegistrationForm`, not a backend-enforced enum, so
 * this admin surface just displays whatever string arrives.
 */

import type { CmsEntityMeta } from "../types";

/**
 * Admin-side triage state for a submission — NOT `CmsPublishStatus`
 * (draft/published/archived): a submission has no publish/revision
 * lifecycle, see the backend entity's own doc comment.
 */
export type CmsPreRegistrationStatus = "new" | "contacted" | "archived";

/**
 * A single Pre-Registration form submission. Extends `CmsEntityMeta`
 * for `id`/`createdAt`/`updatedAt` rather than redeclaring them — the
 * inherited `createdAt` IS the submission time (the backend entity
 * deliberately has no separate `submittedAt` column; this admin UI
 * labels `createdAt` "Submitted" for display, see `PreRegistrationRow`).
 */
export interface CmsPreRegistration extends CmsEntityMeta {
  studentFirstName: string;
  studentLastName: string;
  studentNationalId: string;
  studentBirthDate: string;
  studentGrade: string;
  guardianFullName: string;
  guardianPhone: string;
  guardianEmail?: string;
  notes?: string;
  status: CmsPreRegistrationStatus;
}

/** Body for `PATCH /admin/pre-registrations/:id/status`. Mirrors `UpdatePreRegistrationStatusDto`. */
export interface UpdatePreRegistrationStatusPayload {
  status: CmsPreRegistrationStatus;
}

/**
 * Types for the `pre-registration` feature's submit request, mirroring
 * the backend's `CreatePreRegistrationDto`
 * (`backend/src/modules/website/content/pre-registrations/dto/create-pre-registration.dto.ts`).
 * Same "mirror, don't import" reasoning as every other feature's
 * `types.ts` — this frontend and the NestJS backend are separate
 * packages with no shared runtime code path.
 *
 * One field per `RegistrationForm`'s actual input — no invented
 * fields (no "campus of interest"; the form only collects grade).
 */
export interface PreRegistrationPayload {
  studentFirstName: string;
  studentLastName: string;
  studentNationalId: string;
  studentBirthDate: string;
  studentGrade: string;
  guardianFullName: string;
  guardianPhone: string;
  guardianEmail?: string;
  notes?: string;
}

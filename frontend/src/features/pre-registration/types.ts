/**
 * Types for the `pre-registration` feature's submit request, mirroring
 * the backend's `CreatePreRegistrationDto`
 * (`backend/src/modules/website/content/pre-registrations/dto/create-pre-registration.dto.ts`).
 * Same "mirror, don't import" reasoning as every other feature's
 * `types.ts` — this frontend and the NestJS backend are separate
 * packages with no shared runtime code path.
 *
 * Mirrors the public pre-registration request, including the optional
 * existing campus association.
 */
export interface PreRegistrationPayload {
  studentFirstName: string;
  studentLastName: string;
  studentNationalId: string;
  studentBirthDate: string;
  studentGrade: string;
  campusId?: string | null;
  guardianFullName: string;
  guardianPhone: string;
  guardianEmail?: string;
  notes?: string;
}

export interface PreRegistrationResponse {
  id: string;
  referenceCode: string;
}

export const GRADE_OPTIONS = [
  { value: "grade-1", label: "پایه اول ابتدایی" },
  { value: "grade-2", label: "پایه دوم ابتدایی" },
  { value: "grade-3", label: "پایه سوم ابتدایی" },
  { value: "grade-7", label: "پایه هفتم" },
  { value: "grade-10", label: "پایه دهم" },
] as const;

/**
 * Mirrors `GRADE_OPTIONS` in `frontend/src/features/pre-registration/types.ts`.
 * Keep values and Persian labels aligned when the public form changes.
 */
export const PRE_REGISTRATION_GRADE_LABELS: Record<string, string> = {
  "grade-1": "پایه اول ابتدایی",
  "grade-2": "پایه دوم ابتدایی",
  "grade-3": "پایه سوم ابتدایی",
  "grade-7": "پایه هفتم",
  "grade-10": "پایه دهم",
};

export function getPreRegistrationGradeLabel(grade: string): string {
  return PRE_REGISTRATION_GRADE_LABELS[grade] ?? grade;
}

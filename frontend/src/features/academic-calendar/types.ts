/**
 * CMS-ready shapes for the `academic-calendar` feature.
 *
 * These are frontend-owned types describing the eventual shape of the
 * backend's Academic Calendar content-module data (Website Frontend
 * Architecture §4, §8) — no such Public API endpoint exists yet, so
 * nothing here is fetched. Mirrors the same convention as
 * `@/features/admissions`'s and `@/features/campuses`'s `types.ts`:
 * one interface per section's list-shaped content, so `YearOverview`/
 * `Terms`/`Holidays`/`Exams`/`ImportantDates` can be typed against
 * real data later by changing only where each list (see `./data`)
 * comes from — none of the section components need to change shape.
 */

export interface AcademicYearStat {
  /** Stable identifier, also used as the React list key. */
  id: string;
  /** Display value, e.g. "۱۴۰۴/۰۶/۱۵" or "۲". */
  value: string;
  label: string;
}

export interface AcademicTerm {
  /** Stable identifier, also used as the React list key. */
  id: string;
  /** Display order, e.g. "۱", "۲" — shown as the term's number label. */
  order: string;
  title: string;
  /** Human-readable date range, e.g. "۱۴۰۴/۰۶/۱۵ تا ۱۴۰۴/۱۰/۳۰". */
  dateRange: string;
  description: string;
}

export interface Holiday {
  /** Stable identifier, also used as the React list key. */
  id: string;
  name: string;
  /** Human-readable date, e.g. "۱۴۰۴/۰۷/۱۳". */
  date: string;
  description: string;
}

export interface ExamPeriod {
  /** Stable identifier, also used as the React list key. */
  id: string;
  title: string;
  /** Human-readable date range, e.g. "۱۴۰۴/۱۰/۲۰ تا ۱۴۰۴/۱۰/۳۰". */
  dateRange: string;
  description: string;
}

export interface ImportantDate {
  /** Stable identifier, also used as the React list key. */
  id: string;
  title: string;
  /** Human-readable date, e.g. "۱۴۰۴/۰۶/۰۱". */
  date: string;
  description: string;
}

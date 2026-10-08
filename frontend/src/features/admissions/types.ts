/**
 * CMS-ready shapes for the `admissions` feature.
 *
 * These are frontend-owned types describing the eventual shape of the
 * backend's Admissions content-module data (Website Frontend
 * Architecture §4, §8) — no such Public API endpoint exists yet, so
 * nothing here is fetched. Mirrors the same convention as
 * `@/features/campuses`'s and `@/features/teachers`'s `types.ts`: one
 * interface per section's list-shaped content, so `AdmissionSteps`/
 * `Requirements`/`RequiredDocuments`/`TuitionOverview` can be typed
 * against real data later by changing only where each list (see
 * `./data`) comes from — none of the section components need to
 * change shape.
 */

export interface AdmissionStep {
  /** Stable identifier, also used as the React list key. */
  id: string;
  /** Display order, e.g. "۱", "۲" — shown as the step's number label. */
  order: string;
  title: string;
  description: string;
}

export interface Requirement {
  /** Stable identifier, also used as the React list key. */
  id: string;
  title: string;
  description: string;
}

export interface RequiredDocument {
  /** Stable identifier, also used as the React list key. */
  id: string;
  title: string;
  description: string;
}

export interface TuitionPlan {
  /** Stable identifier, also used as the React list key. */
  id: string;
  /** Grade/level label this plan applies to, e.g. "دوره ابتدایی". */
  title: string;
  /** Human-readable placeholder price, e.g. "از ۰۰۰,۰۰۰,۰۰ تومان". */
  price: string;
  /** Billing period label, e.g. "سالانه". */
  period: string;
  /** Short inclusion labels, e.g. "کتاب و جزوه", "بیمه حوادث". */
  includes: readonly string[];
}

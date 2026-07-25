/**
 * Public API response types for the backend's Statistics content
 * module, consumed by the `statistics` feature's data-fetching hook
 * (`./api`, `./useStatistics`).
 *
 * Mirrors `PublicStatisticDto`
 * (`backend/src/modules/website/public-api/statistics/public-statistics.controller.ts`)
 * — the actual shape returned by `GET /public/statistics` — rather
 * than a pre-formatted display literal. Same "mirror, don't import"
 * reasoning as the CMS admin's `types.ts` files: the marketing
 * frontend and the NestJS backend are separate packages with no
 * shared runtime code path.
 *
 * `label` is translatable (backend `Translatable<string>`, `fa`
 * required/`en` optional) rather than a plain string — the site ships
 * Persian-only for now (`@/i18n/locale.ts`'s Phase 1 scope), so
 * consumers read `.fa` directly, same convention that module
 * documents for when a second locale is reintroduced.
 *
 * `value`/`suffix` stay split (numeric + optional trailing unit)
 * rather than a single pre-formatted string, matching the `Statistic`
 * entity's own doc comment — so a consumer can animate/format the
 * numeric part (e.g. via `toPersianDigits`) independently of the
 * trailing decoration.
 */

/** Local mirror of the backend kernel's `Translatable<T>` — `fa` required, `en` optional. */
export interface Translatable<T = string> {
  fa: T;
  en?: T;
}

/** Full shape of one entry returned by `GET {publicApiBaseUrl}/statistics`. */
export interface StatisticItem {
  id: string;
  label: Translatable<string>;
  value: number;
  suffix?: string;
  icon?: string;
  position: number;
}

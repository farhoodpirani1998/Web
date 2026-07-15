/**
 * CMS-ready `StatisticItem` shape for the `statistics` feature,
 * consumed by the feature's data-fetching hook (`./api`,
 * `./useStatistics`).
 *
 * Mirrors the same structure `@/features/about`'s `AboutStatItem` and
 * `StatisticsGrid`'s current placeholder literal already use: a
 * pre-formatted, Persian-digit display value plus a label, so
 * `StatisticsGrid` stays typed the same way regardless of whether
 * it's rendering live API data or the local placeholder fallback.
 */
export interface StatisticItem {
  /** Stable identifier, also used as the React list key. */
  id: string;
  /** Display value, Persian-digit formatted (e.g. "+۱۲٬۰۰۰"). */
  value: string;
  label: string;
}

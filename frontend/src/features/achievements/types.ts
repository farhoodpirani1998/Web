/**
 * Public API response types for the backend's **Achievements** content
 * module (Website Frontend Architecture §4, §8), consumed by the
 * `achievements` feature's data-fetching hook (`./api`, `./useAchievements`).
 *
 * The real endpoint (`GET /public/achievements`) returns a flat,
 * position-ordered list of figures (`id`, display `value` string,
 * translatable `label`, optional `icon`, `position`) — "mirror, don't
 * import", same as the `features` feature's `types.ts`.
 */

/** Local mirror of the backend kernel's `Translatable<T>` — `fa` required, `en` optional. */
export interface Translatable<T = string> {
  fa: T;
  en?: T;
}

export interface AchievementItem {
  /** Stable identifier. */
  id: string;
  /** Already-formatted display value, e.g. "۱۵+" or "۹۵٪". */
  value: string;
  label: Translatable<string>;
  /** Optional icon-library key (unused by the band today; kept for parity). */
  icon?: string;
  position: number;
}

/** Full shape returned by `GET {publicApiBaseUrl}/achievements`. */
export type Achievements = readonly AchievementItem[];

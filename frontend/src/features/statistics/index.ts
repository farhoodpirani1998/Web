/**
 * Public surface of the `statistics` feature.
 *
 * Per §30/§32 ("features never reach into another feature's
 * internals"), other layers (pages, other features) import these
 * section components only from here — never from the individual
 * `./StatisticsHero`, `./StatisticsGrid` files directly.
 *
 * `fetchStatistics`/`useStatistics`/`statisticsQueryKey` and the
 * `StatisticItem` type are additive exports, following the same shape
 * `@/features/campuses`'s and `@/features/about`'s public surfaces
 * already export their fetch layer through. `HomeStatsBand` is
 * unaffected — its numeric count-up shape is a different Figma-driven
 * data domain from `StatisticsGrid`'s pre-formatted figures (same
 * "home band owns its own placeholder content" convention already
 * used by `HomeCampuses`), so it keeps rendering its own local literal.
 */
export { StatisticsHero } from "./StatisticsHero";
export { StatisticsGrid } from "./StatisticsGrid";
export { HomeStatsBand } from "./HomeStatsBand";

export { fetchStatistics } from "./api";
export { useStatistics, statisticsQueryKey } from "./useStatistics";
export type { StatisticItem } from "./types";

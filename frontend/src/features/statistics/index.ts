/**
 * Public surface of the `statistics` feature.
 *
 * Per §30/§32 ("features never reach into another feature's
 * internals"), other layers (pages, other features) import these
 * section components only from here — never from the individual
 * `./StatisticsHero`, `./StatisticsGrid` files directly.
 */
export { StatisticsHero } from "./StatisticsHero";
export { StatisticsGrid } from "./StatisticsGrid";

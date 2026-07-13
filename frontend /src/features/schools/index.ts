/**
 * Public surface of the `schools` feature.
 *
 * Per §30/§32 ("features never reach into another feature's
 * internals"), other layers (pages, other features) import these
 * section components only from here — never from the individual
 * `./SchoolsHero`, `./SchoolsList` files directly.
 */
export { SchoolsHero } from "./SchoolsHero";
export { SchoolsList } from "./SchoolsList";

/**
 * Public surface of the `news` feature.
 *
 * Per §30/§32 ("features never reach into another feature's
 * internals"), other layers (pages, other features) import these
 * section components only from here — never from the individual
 * `./NewsHero`, `./NewsList` files directly.
 */
export { NewsHero } from "./NewsHero";
export { NewsList } from "./NewsList";

/**
 * Public surface of the `gallery` feature.
 *
 * Per §30/§32 ("features never reach into another feature's
 * internals"), other layers (pages, other features) import these
 * section components only from here — never from the individual
 * `./GalleryHero`, `./GalleryGrid` files directly.
 */
export { GalleryHero } from "./GalleryHero";
export { GalleryGrid } from "./GalleryGrid";

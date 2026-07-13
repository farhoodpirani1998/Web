/**
 * Public surface of the `gallery` feature.
 *
 * Per §30/§32 ("features never reach into another feature's
 * internals"), other layers (pages, other features) import these
 * section components only from here — never from the individual
 * `./GalleryHero`, `./GalleryGrid`, etc. files directly.
 *
 * `GalleryHero` and `GalleryGrid` are the feature's original exports
 * and are unchanged by this extension — every existing import of
 * either keeps working exactly as before. `GalleryCard`,
 * `GalleryDetails`, `FAQ`, `EmptyState`, and the `GalleryItem`/
 * `GalleryImage` types are additive exports, following the same
 * `campuses`/`teachers` feature shape. `EmptyState` is exported for
 * future wiring (see its own file's doc comment) but is not composed
 * by `GalleryPage` today.
 */
export { GalleryHero } from "./GalleryHero";
export { GalleryGrid } from "./GalleryGrid";
export { GalleryCard, type GalleryCardProps } from "./GalleryCard";
export { GalleryDetails } from "./GalleryDetails";
export { FAQ } from "./FAQ";
export { EmptyState } from "./EmptyState";
export type { GalleryItem, GalleryImage } from "./types";
export { galleryItems } from "./data";

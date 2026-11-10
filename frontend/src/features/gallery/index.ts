/**
 * Public surface of the `gallery` feature.
 *
 * Per §30/§32 ("features never reach into another feature's
 * internals"), other layers (pages, other features) import these
 * section components only from here — never from the individual
 * `./GalleryHero`, `./GalleryGrid`, etc. files directly.
 *
 * Exports the page sections, API functions, query hooks, and their
 * associated public types.
 */
export { GalleryHero } from "./GalleryHero";
export { GalleryGrid } from "./GalleryGrid";
export { HomeGallery } from "./HomeGallery";
export { GalleryCard, type GalleryCardProps } from "./GalleryCard";
export { GalleryDetails } from "./GalleryDetails";
export { FAQ } from "./FAQ";
export { EmptyState } from "./EmptyState";
export type { GalleryItem, GalleryImage } from "./types";
export { galleryItems } from "./data";
export { fetchGallery } from "./api";
export { useGallery, galleryQueryKey } from "./useGallery";

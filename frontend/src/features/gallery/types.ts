/**
 * `GalleryItem` shape for the `gallery` feature — the backend's
 * Gallery/Media content-module data (Website Frontend Architecture
 * §4, §8), consumed by the feature's data-fetching hook (`./api`,
 * `./useGallery`).
 *
 * Mirrors the same structure as `@/features/campuses`'s `types.ts`
 * (`Campus`/`CampusImage`) and `@/features/teachers`'s `types.ts`
 * (`Teacher`/`TeacherImage`): a title, a category, an image, and a
 * longer description, so `GalleryCard`/`GalleryGrid`/`GalleryDetails`
 * stay typed the same way regardless of whether they're rendering
 * live API data or the local placeholder fallback in `./data`.
 */

export interface GalleryImage {
  /** Required alt text (§26) — describes the photo, not "placeholder". */
  alt: string;
  /**
   * Real asset URL, once the Gallery/Media content module exists.
   * Left undefined for every placeholder entry in `./data` — sections
   * render a labelled placeholder surface instead of guessing a URL
   * (same convention as `CampusCard`/`TeacherCard`).
   */
  src?: string;
}

export interface GalleryItem {
  /** Stable identifier, also used as the React list key and the
   *  `GalleryDetails` anchor id (`#gallery-{id}`). */
  id: string;
  title: string;
  /** Short grouping label, e.g. "فضای آموزشی", "رویداد". */
  category: string;
  image: GalleryImage;
  /** Longer copy shown on `GalleryDetails` (expanded context). */
  description: string;
}

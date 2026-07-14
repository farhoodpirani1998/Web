/**
 * CMS-ready `GalleryItem` shape for the `gallery` feature.
 *
 * This is a frontend-owned type describing the eventual shape of the
 * backend's Gallery/Media content-module data (Website Frontend
 * Architecture §4, §8) — no such Public API endpoint exists yet, so
 * nothing here is fetched. Mirrors the same structure as
 * `@/features/campuses`'s `types.ts` (`Campus`/`CampusImage`) and
 * `@/features/teachers`'s `types.ts` (`Teacher`/`TeacherImage`): a
 * title, a category, an image, and a longer description, so
 * `GalleryCard`/`GalleryGrid`/`GalleryDetails` can be typed against
 * real data later by changing only where `galleryItems` (see `./data`)
 * comes from — none of the section components need to change shape.
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

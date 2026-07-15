/**
 * `Event` shape for the `events` feature — the backend's Events
 * content-module data (Website Frontend Architecture §4, §8),
 * consumed by the feature's data-fetching hook (`./api`,
 * `./useEvents`).
 *
 * Mirrors the same structure as `@/features/campuses`'s `types.ts`
 * (`Campus`/`CampusImage`) and `@/features/teachers`'s `types.ts`
 * (`Teacher`/`TeacherImage`): a short summary, a longer description,
 * an image, and a set of tag labels, so `EventCard`/`EventList`/
 * `EventDetails` stay typed the same way regardless of whether
 * they're rendering live API data or the local placeholder fallback
 * in `./data`.
 */

export interface EventImage {
  /** Required alt text (§26) — describes the event, not "placeholder". */
  alt: string;
  /**
   * Real asset URL, once the Events/Media content module exists. Left
   * undefined for every placeholder entry in `./data` — sections
   * render a labelled placeholder surface instead of guessing a URL
   * (same convention as `GalleryGrid`/`CampusCard`/`TeacherCard`).
   */
  src?: string;
}

export interface Event {
  /** Stable identifier, also used as the React list key. */
  id: string;
  title: string;
  /** Short summary shown on `EventCard` (list/overview context). */
  description: string;
  /** Longer copy shown on `EventDetails` (expanded context). */
  detailedDescription: string;
  /** Event category/type label, e.g. "جشن مدرسه". */
  category: string;
  /** Human-readable date, e.g. "۱۵ آبان ۱۴۰۳". */
  date: string;
  /** Human-readable time range, e.g. "۹:۰۰ تا ۱۲:۰۰". */
  time: string;
  /** Venue or campus name/address the event is held at. */
  location: string;
  image: EventImage;
  /** Short highlight labels, e.g. "ویژه دانش‌آموزان", "ثبت‌نام آزاد". */
  tags: readonly string[];
}

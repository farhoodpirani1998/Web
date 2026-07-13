/**
 * CMS-ready `Teacher` shape for the `teachers` feature.
 *
 * This is a frontend-owned type describing the eventual shape of the
 * backend's Teachers content-module data (Website Frontend
 * Architecture §4, §8) — no such Public API endpoint exists yet, so
 * nothing here is fetched. Mirrors the same structure as
 * `@/features/campuses`'s `types.ts` (`Campus`/`CampusImage`): name,
 * a short bio, an image, and a set of specialty labels, so
 * `TeacherCard`/`TeacherGrid` can be typed against real data later by
 * changing only where `teachers` (see `./data`) comes from — none of
 * the section components need to change shape.
 */

export interface TeacherImage {
  /** Required alt text (§26) — describes the teacher, not "placeholder". */
  alt: string;
  /**
   * Real asset URL, once the Teachers/Media content module exists.
   * Left undefined for every placeholder entry in `./data` — sections
   * render a labelled placeholder surface instead of guessing a URL
   * (same convention as `GalleryGrid`/`CampusCard`).
   */
  src?: string;
}

export interface Teacher {
  /** Stable identifier, also used as the React list key. */
  id: string;
  name: string;
  /** Subject or role, e.g. "دبیر ریاضی". */
  subject: string;
  /** Short biography shown on `TeacherCard`. */
  bio: string;
  image: TeacherImage;
  /** Short qualification/specialty labels, e.g. "کارشناسی ارشد ریاضی". */
  specialties: readonly string[];
}

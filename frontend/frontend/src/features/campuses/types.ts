/**
 * CMS-ready `Campus` shape for the `campuses` feature.
 *
 * This is a frontend-owned type describing the eventual shape of the
 * backend's Campuses content-module data (Website Frontend
 * Architecture §4, §8) — no such Public API endpoint exists yet, so
 * nothing here is fetched. Every field the Sprint brief asked to
 * "prepare the structure for" (name, description, address, contact
 * info, image, features) is represented below so `CampusCard`/
 * `CampusList`/`CampusDetails` can be typed against real data later by
 * changing only where `campuses` (see `./data`) comes from — none of
 * the section components need to change shape.
 */

export interface CampusContact {
  /** Human-readable phone number, e.g. "۰۲۱-۱۲۳۴۵۶۷۸". */
  phone: string;
  /** `tel:` deep link for `phone`. */
  phoneHref: string;
  /** Optional email address; omitted entirely if not provided. */
  email?: string;
}

export interface CampusImage {
  /** Required alt text (§26) — describes the campus, not "placeholder". */
  alt: string;
  /**
   * Real asset URL, once the Campuses/Media content module exists.
   * Left undefined for every placeholder entry in `./data` — sections
   * render a labelled placeholder surface instead of guessing a URL
   * (same convention as `GalleryGrid`).
   */
  src?: string;
}

export interface Campus {
  /** Stable identifier, also used as the React list key. */
  id: string;
  name: string;
  /** Short summary shown on `CampusCard` (list/overview context). */
  description: string;
  /** Longer copy shown on `CampusDetails` (expanded context). */
  detailedDescription: string;
  area: string;
  address: string;
  contact: CampusContact;
  image: CampusImage;
  /** Short amenity/highlight labels, e.g. "کتابخانه", "سالن ورزشی". */
  features: readonly string[];
}

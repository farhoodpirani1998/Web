/**
 * `GalleryItem` shape for the `gallery` feature — the backend's
 * Gallery/Media content-module data (Website Frontend Architecture
 * §4, §8), consumed by the feature's data-fetching hook (`./api`,
 * `./useGallery`).
 *
 * Two shapes live here (same split as the `hero`/`statistics`
 * features):
 * - `PublicGalleryItemDto`/`PublicMediaRef`/`Translatable`/
 *   `PublicPaginatedResponse` mirror the real wire response from
 *   `GET /public/gallery`
 *   (`backend/.../public-api/gallery/public-gallery.controller.ts`) —
 *   a *paginated* list of published items, ordered by `position`.
 *   "Mirror, don't import" — this feature never imports backend code.
 * - `GalleryItem`/`GalleryImage` are the shape `GalleryCard`/
 *   `GalleryGrid`/`GalleryDetails` already render — `./api.ts` adapts
 *   each DTO into this shape so no component needs to change.
 */

/** Local mirror of the backend kernel's `Translatable<T>` — `fa` required, `en` optional. */
export interface Translatable<T = string> {
  fa: T;
  en?: T;
}

/** Local mirror of the public-api layer's `PublicMediaRef` — only the fields the public site needs. */
export interface PublicMediaRef {
  url: string;
  thumbnailUrl?: string;
  cardUrl?: string;
  altText: string;
}

/** Local mirror of the public-api layer's `PaginationMeta`/`PaginatedResult<T>`. */
export interface PublicPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PublicPaginatedResponse<T> {
  items: T[];
  meta: PublicPaginationMeta;
}

/** Wire shape of one entry in `GET {publicApiBaseUrl}/gallery`'s `items` array. */
export interface PublicGalleryItemDto {
  id: string;
  image: PublicMediaRef | null;
  caption?: Translatable<string>;
  category?: string;
  position: number;
}

export interface GalleryImage {
  /** Required alt text (§26) — describes the photo, not "placeholder". */
  alt: string;
  /**
   * Real asset URL, once the Gallery/Media content module has an
   * image for this item. Left `undefined` when the CMS item has no
   * resolvable image (or for every placeholder entry in `./data`) —
   * sections render a labelled placeholder surface instead of
   * guessing a URL (same convention as `CampusCard`/`TeacherCard`).
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

import type { PublicSeoDto, StructuredDataItem } from "@/shared/seo";

/**
 * `Campus` shape for the `campuses` feature — the backend's Campuses
 * content-module data (Website Frontend Architecture §4, §8),
 * consumed by the feature's data-fetching hook (`./api`, `./useCampuses`).
 *
 * Two shapes live here (same split as `@/features/news`):
 * - `PublicCampusListItemDto`/`PublicMediaRef`/`Translatable` mirror
 *   the real wire response from `GET /public/campuses`
 *   (`backend/src/modules/website/public-api/campuses/public-campuses.controller.ts`)
 *   — a flat, position-ordered array, no pagination. "Mirror, don't
 *   import" — this feature never imports backend code.
 * - `Campus` is the shape `CampusCard`/`CampusList`/`CampusDetails`
 *   already render — `./api.ts`'s `toCampus` adapts each DTO into
 *   this shape so no section component needs to change shape.
 *
 * Contract gaps vs. the original frontend-only `Campus` type:
 * - The backend has no `area` or `features` concept at all (the
 *   Campus entity carries `title`/`excerpt`/`body`/`address`/`mapUrl`/
 *   `phone`/`email`/`featuredImage` — see the entity's doc comment).
 *   Both are now optional and rendered conditionally by `CampusCard`/
 *   `CampusDetails` rather than invented.
 * - `address`/`phone`/`email` are optional on the entity, so `contact`
 *   fields and `address` are optional here too.
 * - The list endpoint carries `excerpt`, never the campus's full
 *   `body` — that only exists on the (unused-by-this-feature)
 *   `GET /public/campuses/:slug` detail response. See `./api.ts`'s
 *   `toCampus` doc comment for how `detailedDescription` is populated
 *   from what the list actually returns (same "degrade gracefully"
 *   approach `news`'s `toNewsItem` uses for its `body` field).
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

/** Wire shape of one entry in `GET {publicApiBaseUrl}/campuses`'s response array. */
export interface PublicCampusListItemDto {
  id: string;
  title: Translatable<string>;
  slug: string;
  excerpt?: Translatable<string>;
  address?: Translatable<string>;
  mapUrl?: string;
  phone?: string;
  email?: string;
  position: number;
  featuredImage: PublicMediaRef | null;
}

/**
 * Wire shape of `GET {publicApiBaseUrl}/campuses/:slug}`'s response —
 * mirrors the backend's `PublicCampusDetailDto`
 * (`public-campuses.controller.ts`), which extends the list item DTO
 * with `body`/`seo`/`structuredData`/`updatedAt`. `seo`/
 * `structuredData` are typed via the shared `@/shared/seo` layer
 * (`PublicSeoDto`/`StructuredDataItem`, §21) rather than re-mirrored
 * here, same as `@/features/news`'s `PublicNewsDetailDto`.
 */
export interface PublicCampusDetailDto extends PublicCampusListItemDto {
  body: Translatable<string>;
  seo: PublicSeoDto;
  structuredData: readonly StructuredDataItem[];
  updatedAt: string;
}

export interface CampusContact {
  /** Human-readable phone number, e.g. "۰۲۱-۱۲۳۴۵۶۷۸"; omitted if the campus has none on file. */
  phone?: string;
  /** `tel:` deep link for `phone`; always present when `phone` is. */
  phoneHref?: string;
  /** Optional email address; omitted entirely if not provided. */
  email?: string;
}

export interface CampusImage {
  /** Required alt text (§26) — describes the campus, not "placeholder". */
  alt: string;
  /**
   * Real asset URL, from the Campuses module's `featuredImage`.
   * Undefined when the campus has no featured image set — sections
   * render a labelled placeholder surface instead of guessing a URL
   * (same convention as `GalleryGrid`).
   */
  src?: string;
}

export interface Campus {
  /** Stable identifier, also used as the React list key and the `CampusDetails` anchor id. */
  id: string;
  /** Public slug (`/public/campuses/:slug`); not currently routed to, kept for future per-campus pages. */
  slug: string;
  name: string;
  /** Short summary shown on `CampusCard` (list/overview context). */
  description: string;
  /** Longer copy shown on `CampusDetails` (expanded context). */
  detailedDescription: string;
  /** Not modeled on the backend today — optional, rendered conditionally. */
  area?: string;
  address?: string;
  contact: CampusContact;
  image: CampusImage;
  /** Not modeled on the backend today — optional, rendered conditionally. */
  features?: readonly string[];
}

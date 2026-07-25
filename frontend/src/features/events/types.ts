import type { PublicSeoDto, StructuredDataItem } from "@/shared/seo";

/**
 * `Event` shape for the `events` feature — the backend's Events
 * content-module data (Website Frontend Architecture §4, §8),
 * consumed by the feature's data-fetching hook (`./api`,
 * `./useEvents`).
 *
 * Two shapes live here (same split as `@/features/news`'s
 * `types.ts`):
 * - `PublicEventListItemDto`/`PublicMediaRef`/`Translatable`/
 *   `PublicPaginatedResponse` mirror the real wire response from
 *   `GET /public/events`
 *   (`backend/.../public-api/events/public-events.controller.ts`) —
 *   a *paginated* list of published, upcoming-by-default events,
 *   soonest-first (`startAt` asc — see the controller). "Mirror,
 *   don't import" — this feature never imports backend code.
 * - `Event` is the shape `EventCard`/`EventList`/`EventDetails`
 *   already render — `./api.ts` adapts each DTO into this shape so
 *   no component needs to change.
 *
 * Note: like `@/features/news`'s list DTO, the events list endpoint's
 * DTO carries `excerpt`, not the event's full `body` — that only
 * exists on the (unused-by-this-feature) `GET /public/events/:slug`
 * detail response. See `./api.ts`'s `toEvent` doc comment for how
 * `Event.detailedDescription` is populated from what the list
 * actually returns.
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

/** Wire shape of one entry in `GET {publicApiBaseUrl}/events`'s `items` array. */
export interface PublicEventListItemDto {
  id: string;
  title: Translatable<string>;
  slug: string;
  excerpt?: Translatable<string>;
  category?: string;
  tags?: string[];
  location?: Translatable<string>;
  locationUrl?: string;
  /** ISO datetime string on the wire (JSON has no native `Date`). */
  startAt: string;
  /** ISO datetime string on the wire; omitted for single-point-in-time events. */
  endAt?: string;
  allDay: boolean;
  featuredImage: PublicMediaRef | null;
}

/**
 * Wire shape of `GET {publicApiBaseUrl}/events/:slug}`'s response —
 * mirrors the backend's `PublicEventDetailDto`
 * (`public-events.controller.ts`), which extends the list item DTO
 * with `body`/`seo`/`structuredData`/`updatedAt`. `seo`/
 * `structuredData` are typed via the shared `@/shared/seo` layer
 * (`PublicSeoDto`/`StructuredDataItem`, §21) rather than re-mirrored
 * here, same as `@/features/news`'s `PublicNewsDetailDto`.
 */
export interface PublicEventDetailDto extends PublicEventListItemDto {
  body: Translatable<string>;
  seo: PublicSeoDto;
  structuredData: readonly StructuredDataItem[];
  updatedAt: string;
}

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
  /** Public slug (`/events/:slug`) — links `EventCard` to `EventDetailPage`. */
  slug: string;
  title: string;
  /** Short summary shown on `EventCard` (list/overview context). */
  description: string;
  /** Longer copy shown on `EventDetails` (expanded context). */
  detailedDescription: string;
  /** Event category/type label, e.g. "جشن مدرسه". */
  category: string;
  /** Human-readable date, Persian calendar formatted, e.g. "۱۵ آبان ۱۴۰۳". */
  date: string;
  /** Human-readable time range, e.g. "۹:۰۰ تا ۱۲:۰۰", or an all-day label. */
  time: string;
  /** Venue or campus name/address the event is held at. */
  location: string;
  image: EventImage;
  /** Short highlight labels, e.g. "ویژه دانش‌آموزان", "ثبت‌نام آزاد". */
  tags: readonly string[];
}

import type { PublicSeoDto, StructuredDataItem } from "@/shared/seo";

/**
 * `NewsItem` shape for the `news` feature — the backend's
 * News/Announcements content-module data (Website Frontend
 * Architecture §4, §8), consumed by the feature's data-fetching hook
 * (`./api`, `./useNews`).
 *
 * Two shapes live here (same split as the `hero`/`statistics`
 * features):
 * - `PublicNewsListItemDto`/`PublicMediaRef`/`Translatable`/
 *   `PublicPaginatedResponse` mirror the real wire response from
 *   `GET /public/news`
 *   (`backend/.../public-api/news/public-news.controller.ts`) — a
 *   *paginated* list of published articles, newest-first
 *   (`publishAt` desc, then `createdAt` desc). "Mirror, don't
 *   import" — this feature never imports backend code.
 * - `NewsItem` is the shape `NewsCard`/`NewsList`/`NewsDetails`/
 *   `HomeNews` already render — `./api.ts` adapts each DTO into this
 *   shape so no component needs to change.
 *
 * Note: the list endpoint's DTO carries `excerpt`, not the article's
 * full `body` — that only exists on the (unused-by-this-feature)
 * `GET /public/news/:slug` detail response. See `./api.ts`'s
 * `toNewsItem` doc comment for how `NewsItem.body` is populated from
 * what the list actually returns.
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

/** Wire shape of one entry in `GET {publicApiBaseUrl}/news`'s `items` array. */
export interface PublicNewsListItemDto {
  id: string;
  title: Translatable<string>;
  slug: string;
  excerpt?: Translatable<string>;
  category?: string;
  tags?: string[];
  featuredImage: PublicMediaRef | null;
  /** ISO datetime string on the wire (JSON has no native `Date`). */
  publishAt?: string;
}

/**
 * Wire shape of `GET {publicApiBaseUrl}/news/:slug}`'s response —
 * mirrors the backend's `PublicNewsDetailDto`
 * (`public-news.controller.ts`), which extends the list item DTO
 * with `body`/`seo`/`structuredData`/`updatedAt`. `seo`/
 * `structuredData` are typed via the shared `@/shared/seo` layer
 * (`PublicSeoDto`/`StructuredDataItem`, §21) rather than re-mirrored
 * here, same as `@/features/about`'s `PublicAboutDto`.
 */
export interface PublicNewsDetailDto extends PublicNewsListItemDto {
  body: Translatable<string>;
  seo: PublicSeoDto;
  structuredData: readonly StructuredDataItem[];
  updatedAt: string;
}

export interface NewsItem {
  /** Stable identifier, also used as the React list key and the
   *  `NewsDetails` anchor id (`#news-{id}`). */
  id: string;
  /** Public slug (`/news/:slug`) — links `NewsCard` to `NewsDetailPage`. */
  slug: string;
  title: string;
  /** Short grouping label, e.g. "اطلاعیه", "رویداد", "دستاورد". */
  category: string;
  /** Publish date, Persian calendar formatted (e.g. "۱۴۰۴/۰۴/۰۱"). */
  date: string;
  /** Short summary shown on `NewsCard` (list/overview context). */
  excerpt: string;
  /** Longer copy shown on `NewsDetails` (expanded context). */
  body: string;
  /** Cover photo asset URL; omitted while no image exists for the article. */
  imageUrl?: string;
}

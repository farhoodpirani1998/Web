import { apiClient } from "@/shared/api";
import { formatPersianDate } from "@/shared/utils/formatDate";

import type {
  NewsItem,
  PublicNewsDetailDto,
  PublicNewsListItemDto,
  PublicPaginatedResponse,
} from "./types";

/**
 * Request functions for the `news` feature's Public API endpoint.
 *
 * Per §14/§30, this is the only file in the `news` feature aware of
 * the endpoint's URL — `useNews` and any future consumer call
 * `fetchNews`, never `apiClient` directly.
 *
 * The real endpoint (`GET /public/news`) is paginated
 * (`{ items, meta }`), already newest-first (`publishAt` desc, then
 * `createdAt` desc — see the controller), matching the ordering
 * `./data`'s placeholder array already uses. `NewsList`/`NewsDetails`/
 * `HomeNews` render a flat list with no pagination controls of their
 * own, so `fetchNews` requests a single page at the Public API's own
 * max page size (see backend `public-api/common/pagination.ts`'s
 * `MAX_LIMIT`) and adapts every item in it.
 */
const NEWS_PAGE_LIMIT = 100;

export async function fetchNews(campusId?: string): Promise<readonly NewsItem[]> {
  const response = await apiClient.get<PublicPaginatedResponse<PublicNewsListItemDto>>(
    "/news",
    { params: { limit: NEWS_PAGE_LIMIT, ...(campusId ? { campusId } : {}) } },
  );

  return response.data.items.map(toNewsItem);
}

/**
 * Fetches one article's full detail response (`GET /public/news/:slug`),
 * unlike `fetchNews`, this is returned as the raw `PublicNewsDetailDto`
 * The article detail page consumes this DTO directly, preserving
 * `seo`/`structuredData` as returned by the backend.
 */
export async function fetchNewsBySlug(slug: string): Promise<PublicNewsDetailDto> {
  const response = await apiClient.get<PublicNewsDetailDto>(`/news/${slug}`);
  return response.data;
}

/**
 * Adapts one wire `PublicNewsListItemDto` into the `NewsItem` shape
 * `NewsCard`/`NewsList`/`NewsDetails`/`HomeNews` already render.
 *
 * The list response already includes the full article body, so the
 * list and inline details can render it without per-article requests.
 */
function toNewsItem(dto: PublicNewsListItemDto): NewsItem {
  const excerpt = dto.excerpt?.fa ?? "";

  return {
    id: dto.id,
    slug: dto.slug,
    title: dto.title.fa,
    category: dto.category ?? "",
    date: formatPersianDate(dto.publishAt),
    excerpt,
    body: dto.body?.fa ?? excerpt,
    imageUrl: dto.featuredImage?.url,
  };
}

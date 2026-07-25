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

export async function fetchNews(): Promise<readonly NewsItem[]> {
  const response = await apiClient.get<PublicPaginatedResponse<PublicNewsListItemDto>>(
    "/news",
    { params: { limit: NEWS_PAGE_LIMIT } },
  );

  return response.data.items.map(toNewsItem);
}

/**
 * Fetches one article's full detail response (`GET /public/news/:slug`),
 * unlike `fetchNews`, this is returned as the raw `PublicNewsDetailDto`
 * rather than adapted into `NewsItem` — no page/component consumes it
 * yet (§7 — News has no per-article route), so there's no target shape
 * to adapt into. `seo`/`structuredData` are preserved exactly as the
 * backend returns them, for a future consumer (e.g. a `<Seo />`-
 * rendering page) to use unchanged.
 */
export async function fetchNewsBySlug(slug: string): Promise<PublicNewsDetailDto> {
  const response = await apiClient.get<PublicNewsDetailDto>(`/news/${slug}`);
  return response.data;
}

/**
 * Adapts one wire `PublicNewsListItemDto` into the `NewsItem` shape
 * `NewsCard`/`NewsList`/`NewsDetails`/`HomeNews` already render.
 *
 * Known contract gap: the list DTO only carries `excerpt`, never the
 * article's full `body` — that field only exists on the
 * `GET /public/news/:slug` detail response, and `NewsDetails` renders
 * every article inline on one page (§7 — no per-article route) rather
 * than through that per-slug endpoint. Fetching the detail endpoint
 * once per list item to fill in `body` would mean N extra requests
 * every time the news list loads, so — same "degrade gracefully
 * rather than fabricate data" approach `hero`'s `toHero` uses for a
 * missing optional field — `body` falls back to the same `excerpt`
 * text the card already shows. This is flagged in the audit report as
 * a remaining risk, not silently papered over.
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
    body: excerpt,
    imageUrl: dto.featuredImage?.url,
  };
}

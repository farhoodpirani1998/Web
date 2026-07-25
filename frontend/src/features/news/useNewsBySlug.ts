import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { fetchNewsBySlug } from "./api";
import type { PublicNewsDetailDto } from "./types";

/**
 * TanStack Query key for one News article's detail resource. Exported
 * so other layers can reference the exact same key without re-typing
 * the literal, same convention as `./useNews`'s `newsQueryKey`.
 */
export function newsDetailQueryKey(slug: string) {
  return ["news", "detail", slug] as const;
}

/**
 * Fetches one article's full detail response (`GET /news/:slug`) via
 * `./api`'s `fetchNewsBySlug` — the raw `PublicNewsDetailDto`,
 * `seo`/`structuredData` included unchanged. Errors surface as the
 * normalized `ApiError` from `@/shared/api` (§14, §18), same as
 * `./useNews`.
 */
export function useNewsBySlug(slug: string): UseQueryResult<PublicNewsDetailDto> {
  return useQuery({
    queryKey: newsDetailQueryKey(slug),
    queryFn: () => fetchNewsBySlug(slug),
    enabled: Boolean(slug),
  });
}

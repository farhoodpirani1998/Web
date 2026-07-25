import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { fetchCampusBySlug } from "./api";
import type { PublicCampusDetailDto } from "./types";

/**
 * TanStack Query key for one Campus's detail resource. Exported so
 * other layers can reference the exact same key without re-typing the
 * literal, same convention as `./useCampuses`'s `campusesQueryKey` and
 * `@/features/news`'s `newsDetailQueryKey`/`@/features/events`'s
 * `eventDetailQueryKey`.
 */
export function campusDetailQueryKey(slug: string) {
  return ["campuses", "detail", slug] as const;
}

/**
 * Fetches one campus's full detail response (`GET /campuses/:slug`)
 * via `./api`'s `fetchCampusBySlug` — the raw `PublicCampusDetailDto`,
 * `seo`/`structuredData` included unchanged. Errors surface as the
 * normalized `ApiError` from `@/shared/api` (§14, §18), same as
 * `./useCampuses` and `@/features/news`'s `useNewsBySlug`.
 */
export function useCampusBySlug(slug: string): UseQueryResult<PublicCampusDetailDto> {
  return useQuery({
    queryKey: campusDetailQueryKey(slug),
    queryFn: () => fetchCampusBySlug(slug),
    enabled: Boolean(slug),
  });
}

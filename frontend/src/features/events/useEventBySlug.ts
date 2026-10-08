import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { fetchEventBySlug } from "./api";
import type { PublicEventDetailDto } from "./types";

/**
 * TanStack Query key for one Event's detail resource. Exported so
 * other layers can reference the exact same key without re-typing the
 * literal, same convention as `./useEvents`'s `eventsQueryKey` and
 * `@/features/news`'s `newsDetailQueryKey`.
 */
export function eventDetailQueryKey(slug: string) {
  return ["events", "detail", slug] as const;
}

/**
 * Fetches one event's full detail response (`GET /events/:slug`) via
 * `./api`'s `fetchEventBySlug` — the raw `PublicEventDetailDto`,
 * `seo`/`structuredData` included unchanged. Errors surface as the
 * normalized `ApiError` from `@/shared/api` (§14, §18), same as
 * `./useEvents` and `@/features/news`'s `useNewsBySlug`.
 */
export function useEventBySlug(slug: string): UseQueryResult<PublicEventDetailDto> {
  return useQuery({
    queryKey: eventDetailQueryKey(slug),
    queryFn: () => fetchEventBySlug(slug),
    enabled: Boolean(slug),
  });
}

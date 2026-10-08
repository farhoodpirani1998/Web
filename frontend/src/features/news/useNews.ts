import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { fetchNews } from "./api";
import type { NewsItem } from "./types";

/**
 * TanStack Query key for the News resource. Exported so other layers
 * can reference the exact same key without re-typing the literal.
 */
export const newsQueryKey = ["news"] as const;

/**
 * Fetches the backend's News/Announcements content module
 * (`GET /news`). Errors surface as the normalized `ApiError` from
 * `@/shared/api` (§14, §18) — callers branch on `error.kind` rather
 * than parsing raw HTTP status codes.
 */
export function useNews(): UseQueryResult<readonly NewsItem[]> {
  return useQuery({
    queryKey: newsQueryKey,
    queryFn: fetchNews,
  });
}

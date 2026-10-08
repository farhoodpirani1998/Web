import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { fetchSiteSettings } from "./api";
import type { SiteSettings } from "./types";

/**
 * TanStack Query key for the Site Settings resource. Exported so other
 * layers (e.g. a future mutation, or a manual `invalidateQueries` call)
 * can reference the exact same key without re-typing the literal.
 */
export const siteSettingsQueryKey = ["site-settings"] as const;

/**
 * Fetches the backend's Site Settings content module
 * (`GET /site-settings`). Errors surface as the normalized `ApiError`
 * from `@/shared/api` (§14, §18) — callers branch on `error.kind`
 * rather than parsing raw HTTP status codes.
 *
 * Site Settings are edited in the separate admin app. Refetch on tab
 * focus so an already-open public site picks up those changes without
 * requiring a full reload.
 */
export function useSiteSettings(): UseQueryResult<SiteSettings> {
  return useQuery({
    queryKey: siteSettingsQueryKey,
    queryFn: fetchSiteSettings,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}

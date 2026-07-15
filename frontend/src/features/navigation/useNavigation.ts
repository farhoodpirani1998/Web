import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { fetchNavigation } from "./api";
import type { Navigation } from "./types";

/**
 * TanStack Query key for the Navigation resource. Exported so other
 * layers can reference the exact same key without re-typing the
 * literal.
 */
export const navigationQueryKey = ["navigation"] as const;

/**
 * Fetches the backend's Navigation content module (`GET /navigation`).
 * Errors surface as the normalized `ApiError` from `@/shared/api`
 * (§14, §18).
 *
 * Data-fetching only: the app shell still renders `NAV_ITEMS` from
 * `src/app/shell/nav-data.ts` (§ "no UI changes yet").
 */
export function useNavigation(): UseQueryResult<Navigation> {
  return useQuery({
    queryKey: navigationQueryKey,
    queryFn: fetchNavigation,
  });
}

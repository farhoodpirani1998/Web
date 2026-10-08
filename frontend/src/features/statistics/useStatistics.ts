import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { fetchStatistics } from "./api";
import type { StatisticItem } from "./types";

/**
 * TanStack Query key for the Statistics resource. Exported so other
 * layers can reference the exact same key without re-typing the
 * literal.
 */
export const statisticsQueryKey = ["statistics"] as const;

/**
 * Fetches the backend's Statistics content module (`GET
 * /statistics`). Errors surface as the normalized `ApiError` from
 * `@/shared/api` (§14, §18) — callers branch on `error.kind` rather
 * than parsing raw HTTP status codes.
 */
export function useStatistics(): UseQueryResult<readonly StatisticItem[]> {
  return useQuery({
    queryKey: statisticsQueryKey,
    queryFn: fetchStatistics,
  });
}

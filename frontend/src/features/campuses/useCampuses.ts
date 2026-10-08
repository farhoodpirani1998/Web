import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { fetchCampuses } from "./api";
import type { Campus } from "./types";

/**
 * TanStack Query key for the Campuses resource. Exported so other
 * layers can reference the exact same key without re-typing the
 * literal.
 */
export const campusesQueryKey = ["campuses"] as const;

/**
 * Fetches the backend's Campuses content module (`GET /campuses`).
 * Errors surface as the normalized `ApiError` from `@/shared/api`
 * (§14, §18) — callers branch on `error.kind` rather than parsing raw
 * HTTP status codes.
 */
export function useCampuses(): UseQueryResult<readonly Campus[]> {
  return useQuery({
    queryKey: campusesQueryKey,
    queryFn: fetchCampuses,
  });
}

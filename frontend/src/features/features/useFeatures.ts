import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { fetchFeatures } from "./api";
import type { Features } from "./types";

/**
 * TanStack Query key for the Features resource. Exported so other
 * layers can reference the exact same key without re-typing the
 * literal.
 */
export const featuresQueryKey = ["features"] as const;

/**
 * Fetches the backend's Features content module (`GET /features`).
 * Errors surface as the normalized `ApiError` from `@/shared/api`
 * (§14, §18) — callers branch on `error.kind` rather than parsing raw
 * HTTP status codes.
 */
export function useFeatures(): UseQueryResult<Features> {
  return useQuery({
    queryKey: featuresQueryKey,
    queryFn: fetchFeatures,
  });
}

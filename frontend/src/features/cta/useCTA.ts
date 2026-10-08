import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { fetchCTA } from "./api";
import type { CTA } from "./types";

/**
 * TanStack Query key for the CTA resource. Exported so other layers
 * can reference the exact same key without re-typing the literal.
 */
export const ctaQueryKey = ["cta"] as const;

/**
 * Fetches the backend's CTA content module (`GET /cta`). Errors
 * surface as the normalized `ApiError` from `@/shared/api` (§14, §18)
 * — callers branch on `error.kind` rather than parsing raw HTTP status
 * codes.
 */
export function useCTA(): UseQueryResult<CTA> {
  return useQuery({
    queryKey: ctaQueryKey,
    queryFn: fetchCTA,
  });
}

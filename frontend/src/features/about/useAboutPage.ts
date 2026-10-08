import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { fetchAboutPage } from "./api";
import type { AboutPageContent } from "./types";

/**
 * TanStack Query key for the About page resource. Exported so other
 * layers can reference the exact same key without re-typing the
 * literal.
 */
export const aboutPageQueryKey = ["about"] as const;

/**
 * Fetches the backend's Static Pages / About content module
 * (`GET /about`). Errors surface as the normalized `ApiError` from
 * `@/shared/api` (§14, §18) — callers branch on `error.kind` rather
 * than parsing raw HTTP status codes.
 */
export function useAboutPage(): UseQueryResult<AboutPageContent> {
  return useQuery({
    queryKey: aboutPageQueryKey,
    queryFn: fetchAboutPage,
  });
}

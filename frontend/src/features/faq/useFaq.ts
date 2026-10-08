import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { fetchFaq } from "./api";
import type { Faq } from "./types";

/**
 * TanStack Query key for the FAQ resource. Exported so other layers
 * can reference the exact same key without re-typing the literal.
 */
export const faqQueryKey = ["faq"] as const;

/**
 * Fetches the backend's FAQ content module (`GET /faq`). Errors
 * surface as the normalized `ApiError` from `@/shared/api` (§14, §18)
 * — callers branch on `error.kind` rather than parsing raw HTTP
 * status codes.
 *
 * Data-fetching only: existing FAQ sections (e.g.
 * `@/features/news`'s `FAQ.tsx`) still render their own local
 * placeholder copy until they're wired to this hook separately.
 */
export function useFaq(): UseQueryResult<Faq> {
  return useQuery({
    queryKey: faqQueryKey,
    queryFn: fetchFaq,
  });
}

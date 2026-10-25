import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { fetchTestimonials } from "./api";
import type { Testimonials } from "./types";

/**
 * TanStack Query key for the Testimonials resource. Exported so other
 * layers can reference the exact same key without re-typing the literal.
 */
export const testimonialsQueryKey = ["testimonials"] as const;

/**
 * Fetches the backend's Testimonials content module
 * (`GET /testimonials`). Errors surface as the normalized `ApiError`
 * from `@/shared/api` (§14, §18).
 */
export function useTestimonials(): UseQueryResult<Testimonials> {
  return useQuery({
    queryKey: testimonialsQueryKey,
    queryFn: fetchTestimonials,
  });
}

import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";

import type { ApiError } from "@/lib/apiError";

import { fetchTestimonialList } from "../api";
import type { CmsTestimonial, CmsTestimonialStatus } from "../types";

/**
 * Fetches the testimonial list (optionally filtered by status), for
 * `TestimonialsPage`. Same shape as `features/cms/faq/hooks/useFaqs`/
 * `features/cms/teachers/hooks/useTeachers` — no cache is needed here
 * the way `media/useMediaById` needs one, since nothing else in this
 * admin resolves a testimonial by id independently of this list.
 *
 * `setTestimonials` is exposed (unlike `useMediaList`, which only
 * exposes `refetch`) because `TestimonialsPage` needs to update the
 * visible order optimistically during drag-reorder, and to splice a
 * single updated testimonial back into the visible list after a
 * status change without a full refetch flash — `PATCH
 * /testimonials/reorder` returns void, so there's no response body to
 * reconcile the list against, same reasoning as `useFaqs`.
 */
export interface UseTestimonialsResult {
  testimonials: CmsTestimonial[];
  isLoading: boolean;
  error: ApiError | null;
  refetch: () => void;
  setTestimonials: Dispatch<SetStateAction<CmsTestimonial[]>>;
}

export function useTestimonials(status?: CmsTestimonialStatus): UseTestimonialsResult {
  const [testimonials, setTestimonials] = useState<CmsTestimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchTestimonialList(status)
      .then((list) => {
        if (!cancelled) setTestimonials(list);
      })
      .catch((err) => {
        if (!cancelled) setError(err as ApiError);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [status, refetchToken]);

  const refetch = useCallback(() => setRefetchToken((token) => token + 1), []);

  return { testimonials, isLoading, error, refetch, setTestimonials };
}

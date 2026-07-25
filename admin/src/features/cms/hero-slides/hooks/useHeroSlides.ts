import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";

import type { ApiError } from "@/lib/apiError";

import { fetchHeroSlideList } from "../api";
import type { CmsHeroSlide, CmsHeroSlideStatus } from "../types";

/**
 * Fetches the hero slide list (optionally filtered by status), for
 * `HeroSlidesPage`. Same shape as `features/cms/gallery/hooks/useGallery`
 * — no cache is needed here the way `media/useMediaById` needs one,
 * since nothing else in this admin resolves a hero slide by id
 * independently of this list.
 *
 * `setSlides` is exposed (unlike `media/useMediaList`, which only
 * exposes `refetch`) because `HeroSlidesPage` needs to update the
 * visible order optimistically during drag-reorder —
 * `PATCH /hero-slides/reorder` returns void, so there's no response
 * body to reconcile the list against, and a full `refetch()` on every
 * drag would be a visible flash for no benefit.
 */
export interface UseHeroSlidesResult {
  slides: CmsHeroSlide[];
  isLoading: boolean;
  error: ApiError | null;
  refetch: () => void;
  setSlides: Dispatch<SetStateAction<CmsHeroSlide[]>>;
}

export function useHeroSlides(status?: CmsHeroSlideStatus): UseHeroSlidesResult {
  const [slides, setSlides] = useState<CmsHeroSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchHeroSlideList(status)
      .then((list) => {
        if (!cancelled) setSlides(list);
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

  return { slides, isLoading, error, refetch, setSlides };
}

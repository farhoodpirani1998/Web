import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";

import type { ApiError } from "@/lib/apiError";

import { fetchGalleryList } from "../api";
import type { CmsGalleryItem, CmsGalleryStatus } from "../types";

/**
 * Fetches the gallery list (optionally filtered by status), for
 * `GalleryPage`. Same shape as `features/cms/faq/hooks/useFaqs` — no
 * cache is needed here the way `media/useMediaById` needs one, since
 * nothing else in this admin resolves a gallery item by id
 * independently of this list.
 *
 * `setItems` is exposed (unlike `media/useMediaList`, which only
 * exposes `refetch`) because `GalleryPage` needs to update the visible
 * order optimistically during drag-reorder — `PATCH /gallery/reorder`
 * returns void, so there's no response body to reconcile the list
 * against, and a full `refetch()` on every drag would be a visible
 * flash for no benefit.
 */
export interface UseGalleryResult {
  items: CmsGalleryItem[];
  isLoading: boolean;
  error: ApiError | null;
  refetch: () => void;
  setItems: Dispatch<SetStateAction<CmsGalleryItem[]>>;
}

export function useGallery(status?: CmsGalleryStatus): UseGalleryResult {
  const [items, setItems] = useState<CmsGalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchGalleryList(status)
      .then((list) => {
        if (!cancelled) setItems(list);
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

  return { items, isLoading, error, refetch, setItems };
}

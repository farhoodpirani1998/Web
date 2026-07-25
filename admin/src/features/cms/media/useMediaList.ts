import { useCallback, useEffect, useState } from "react";

import type { ApiError } from "@/lib/apiError";

import { fetchMediaList } from "./api";
import { setCachedMedia } from "./mediaCache";
import type { CmsMedia, CmsMediaStatus } from "./types";

/**
 * Fetches the media list (optionally filtered by status), e.g. for
 * `MediaPicker` (`./MediaPicker.tsx`) or a future standalone media
 * library page. Kept separate from `useMediaById`'s cache: a list is a
 * point-in-time view of "what exists right now" and isn't itself
 * something later reads should treat as a standing cache entry — but
 * each row it returns *is* fed into that cache (`setCachedMedia`) so a
 * `useMediaById` call for one of those same ids elsewhere doesn't
 * re-fetch it.
 *
 * No pagination/search params, matching `fetchMediaList` — `GET
 * /admin/media` doesn't support them (see the audit, §3).
 *
 * `refetch` is exposed for the one thing this list can't know on its
 * own: when the caller uploads/archives/deletes a media row and wants
 * the list to reflect that immediately, rather than only on next mount.
 */
export interface UseMediaListResult {
  media: CmsMedia[];
  isLoading: boolean;
  error: ApiError | null;
  refetch: () => void;
}

export function useMediaList(status?: CmsMediaStatus): UseMediaListResult {
  const [media, setMedia] = useState<CmsMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchMediaList(status)
      .then((list) => {
        if (cancelled) return;
        setMedia(list);
        for (const item of list) setCachedMedia(item);
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

  return { media, isLoading, error, refetch };
}

import { useEffect, useState, useSyncExternalStore } from "react";

import type { ApiError } from "@/lib/apiError";

import { fetchMediaById } from "./api";
import {
  dedupeMediaFetch,
  getCachedMedia,
  getCachedMediaSnapshot,
  setCachedMedia,
  subscribeToMediaCache,
} from "./mediaCache";
import type { CmsMedia } from "./types";

/**
 * Resolves a `mediaId` (e.g. a future `NewsArticle.featuredImageMediaId`)
 * to its `CmsMedia` row, the shared piece every content module needs per
 * the Sprint 3.3 audit, §6 item 2. Reads/writes the module-level cache
 * in `./mediaCache.ts` — two components resolving the same id (e.g. a
 * thumbnail on a list row and again on that row's edit page) share one
 * cache entry and, if both mount before the first fetch resolves, one
 * in-flight request (`dedupeMediaFetch`).
 *
 * `id` may be `null`/`undefined` so callers don't need to guard before
 * an optional media reference (e.g. a not-yet-set `backgroundMediaId`)
 * is known — this simply skips fetching and returns `media: undefined`.
 *
 * Does not refetch on every render or poll — a cached entry is treated
 * as good until something explicitly overwrites it (`setCachedMedia`)
 * or evicts it (`evictCachedMedia`), same "fetch once, trust the cache"
 * posture as `AuthProvider`'s bootstrap check.
 */
export interface UseMediaByIdResult {
  media: CmsMedia | undefined;
  isLoading: boolean;
  error: ApiError | null;
}

export function useMediaById(id: string | null | undefined): UseMediaByIdResult {
  const cache = useSyncExternalStore(
    subscribeToMediaCache,
    getCachedMediaSnapshot,
    getCachedMediaSnapshot,
  );
  const [error, setError] = useState<ApiError | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const cached = id ? cache.get(id) : undefined;

  useEffect(() => {
    if (!id || getCachedMedia(id)) {
      return;
    }

    let cancelled = false;
    setLoadingId(id);
    setError(null);

    dedupeMediaFetch(id, () => fetchMediaById(id))
      .then((media) => {
        if (!cancelled) setCachedMedia(media);
      })
      .catch((err) => {
        if (!cancelled) setError(err as ApiError);
      })
      .finally(() => {
        if (!cancelled) setLoadingId((current) => (current === id ? null : current));
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return {
    media: cached,
    isLoading: loadingId === id && !cached,
    error,
  };
}

import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { fetchGallery } from "./api";
import type { GalleryItem } from "./types";

/**
 * TanStack Query key for the Gallery resource. Exported so other
 * layers can reference the exact same key without re-typing the
 * literal.
 */
export const galleryQueryKey = ["gallery"] as const;

/**
 * Fetches the backend's Gallery/Media content module (`GET
 * /gallery`). Errors surface as the normalized `ApiError` from
 * `@/shared/api` (§14, §18) — callers branch on `error.kind` rather
 * than parsing raw HTTP status codes.
 */
export function useGallery(): UseQueryResult<readonly GalleryItem[]> {
  return useQuery({
    queryKey: galleryQueryKey,
    queryFn: fetchGallery,
  });
}

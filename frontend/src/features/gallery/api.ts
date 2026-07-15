import { apiClient } from "@/shared/api";

import type { GalleryItem } from "./types";

/**
 * Request functions for the `gallery` feature's Public API endpoint.
 *
 * Per §14/§30, this is the only file in the `gallery` feature aware of
 * the endpoint's URL — `useGallery` and any future consumer call
 * `fetchGallery`, never `apiClient` directly.
 */
export async function fetchGallery(): Promise<readonly GalleryItem[]> {
  const response = await apiClient.get<readonly GalleryItem[]>("/gallery");
  return response.data;
}

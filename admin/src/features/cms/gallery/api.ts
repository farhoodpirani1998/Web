import { apiClient } from "@/lib/apiClient";

import type {
  CmsGalleryItem,
  CmsGalleryStatus,
  CreateGalleryItemPayload,
  UpdateGalleryItemPayload,
} from "./types";

/**
 * Request functions for the CMS Admin Gallery endpoints
 * (`backend/src/modules/website/content/gallery/gallery.controller.ts`,
 * `@Controller('admin/gallery')`).
 *
 * Only this file is aware of the `/gallery` URLs — callers use these
 * functions, never `apiClient` directly (same convention as
 * `features/cms/faq/api.ts`). Paths are bare (`/gallery`, not
 * `/admin/gallery`) because `apiClient`'s base URL already points at
 * `.../admin` (see `lib/env.ts`).
 *
 * No pagination/search params: `GET /admin/gallery` only supports an
 * optional `status` filter today (`GalleryController.findAll`) —
 * nothing here should invent query params the backend doesn't read.
 */

/** `GET /admin/gallery` — optionally filtered by status. Returns a plain array (no pagination). */
export async function fetchGalleryList(status?: CmsGalleryStatus): Promise<CmsGalleryItem[]> {
  const response = await apiClient.get<CmsGalleryItem[]>("/gallery", {
    params: status ? { status } : undefined,
  });
  return response.data;
}

/** `GET /admin/gallery/:id`. Rejects with a `not-found` `ApiError` (see `lib/apiError.ts`) for a bad id. */
export async function fetchGalleryItemById(id: string): Promise<CmsGalleryItem> {
  const response = await apiClient.get<CmsGalleryItem>(`/gallery/${id}`);
  return response.data;
}

/** `POST /admin/gallery`. New gallery items are always created as `draft` server-side (`GalleryService.create`). */
export async function createGalleryItem(
  payload: CreateGalleryItemPayload,
): Promise<CmsGalleryItem> {
  const response = await apiClient.post<CmsGalleryItem>("/gallery", payload);
  return response.data;
}

/** `PATCH /admin/gallery/:id`. Does not touch `status` — see `updateGalleryItemStatus` for that. */
export async function updateGalleryItem(
  id: string,
  payload: UpdateGalleryItemPayload,
): Promise<CmsGalleryItem> {
  const response = await apiClient.patch<CmsGalleryItem>(`/gallery/${id}`, payload);
  return response.data;
}

/**
 * `DELETE /admin/gallery/:id`. Hard delete — `GalleryService.remove`
 * also detaches the `MediaUsage` row for the image, but that's a
 * server-side concern this call doesn't need to know about.
 */
export async function deleteGalleryItem(id: string): Promise<void> {
  await apiClient.delete(`/gallery/${id}`);
}

/**
 * `PATCH /admin/gallery/:id/status`. Gated server-side behind
 * `content:publish` (`GalleryController.updateStatus`), separately from
 * plain field edits (`content:write`) — the two are kept as separate
 * calls here for that reason, not merged into `updateGalleryItem`.
 */
export async function updateGalleryItemStatus(
  id: string,
  status: CmsGalleryStatus,
): Promise<CmsGalleryItem> {
  const response = await apiClient.patch<CmsGalleryItem>(`/gallery/${id}/status`, { status });
  return response.data;
}

/**
 * `PATCH /admin/gallery/reorder`. Writes `position` for exactly the ids
 * given, in that order (`OrderingService.reorder`) — callers must pass
 * the FULL ordered array of ids for the site's gallery list, never a
 * filtered subset, or every id left out keeps its old `position` and
 * ends up interleaved incorrectly with the reordered ones.
 */
export async function reorderGalleryItems(orderedIds: string[]): Promise<void> {
  await apiClient.patch("/gallery/reorder", { orderedIds });
}

import { apiClient } from "@/lib/apiClient";

import type { CmsMedia, CmsMediaStatus, CmsMediaUsage, UploadMediaPayload } from "./types";

/**
 * Request functions for the CMS Admin media endpoints
 * (`backend/src/modules/website/core/media/media.controller.ts`,
 * `@Controller('admin/media')`).
 *
 * Only this file is aware of the `/media` URLs — callers use these
 * functions, never `apiClient` directly (same convention as
 * `features/auth/api.ts`). Paths are bare (`/media`, not `/admin/media`)
 * because `apiClient`'s base URL already points at `.../admin` (see
 * `lib/env.ts`), matching the Sprint 3.3 audit's note on this.
 *
 * No pagination/search params here: `GET /admin/media` only supports an
 * optional `status` filter today (see the audit, §3) — nothing here
 * should invent query params the backend doesn't read.
 */

/** `GET /admin/media` — optionally filtered by status. Returns a plain array (no pagination). */
export async function fetchMediaList(status?: CmsMediaStatus): Promise<CmsMedia[]> {
  const response = await apiClient.get<CmsMedia[]>("/media", {
    params: status ? { status } : undefined,
  });
  return response.data;
}

/** `GET /admin/media/:id`. Rejects with a `not-found` `ApiError` (see `lib/apiError.ts`) for a bad id. */
export async function fetchMediaById(id: string): Promise<CmsMedia> {
  const response = await apiClient.get<CmsMedia>(`/media/${id}`);
  return response.data;
}

/**
 * `GET /admin/media/:id/usage` — every content entity currently
 * referencing this media asset. Rejects with a `not-found` `ApiError`
 * for a bad id, same as `fetchMediaById`.
 */
export async function fetchMediaUsage(id: string): Promise<CmsMediaUsage[]> {
  const response = await apiClient.get<CmsMediaUsage[]>(`/media/${id}/usage`);
  return response.data;
}

/**
 * `POST /admin/media`. Sent as multipart form data — `file` is the
 * upload itself, `altText` is required by the backend's
 * `UploadMediaDto`/`MediaService.upload` (see that file's comment on
 * why: it's mandatory at the service layer, not just the DTO).
 *
 * `onProgress`, if given, is called with a 0–100 integer as the upload
 * streams — driven by axios's own `onUploadProgress` (no new endpoint
 * or polling involved), so `MediaUploadDialog` can show real progress
 * rather than an indeterminate spinner.
 */
export async function uploadMedia(
  { file, altText }: UploadMediaPayload,
  onProgress?: (percent: number) => void,
): Promise<CmsMedia> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("altText", altText);

  // No explicit Content-Type header: axios/the browser derive
  // `multipart/form-data; boundary=...` from the FormData instance
  // itself. Setting a fixed header here would omit the boundary and
  // break the request.
  const response = await apiClient.post<CmsMedia>("/media", formData, {
    onUploadProgress: onProgress
      ? (event) => {
          if (!event.total) return;
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      : undefined,
  });
  return response.data;
}

/** `PATCH /admin/media/:id/archive`. Soft-removal — see `deleteMedia` for the hard-delete counterpart. */
export async function archiveMedia(id: string): Promise<void> {
  await apiClient.patch(`/media/${id}/archive`);
}

/**
 * `DELETE /admin/media/:id`. Hard-deletes the asset — the backend
 * rejects this with a 409 (`ConflictException`) if the asset is still
 * referenced by any content entity's `mediaId` (see `MediaService.purge`).
 * Callers should surface that as-is via `ApiError`'s backend-authored
 * message (see `lib/apiError.ts`), not assume delete always succeeds.
 */
export async function deleteMedia(id: string): Promise<void> {
  await apiClient.delete(`/media/${id}`);
}

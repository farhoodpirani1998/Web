import { apiClient } from "@/lib/apiClient";

import type {
  CmsFeature,
  CmsFeatureStatus,
  CreateFeaturePayload,
  UpdateFeaturePayload,
} from "./types";

/**
 * Request functions for the CMS Admin Features endpoints
 * (`backend/src/modules/website/content/features/features.controller.ts`,
 * `@Controller('admin/features')`).
 *
 * Only this file is aware of the `/features` URLs — callers use these
 * functions, never `apiClient` directly (same convention as
 * `features/cms/faq/api.ts`). Paths are bare (`/features`, not
 * `/admin/features`) because `apiClient`'s base URL already points at
 * `.../admin` (see `lib/env.ts`).
 *
 * No pagination/search params: `GET /admin/features` only supports an
 * optional `status` filter today (`FeaturesController.findAll`) —
 * nothing here should invent query params the backend doesn't read.
 */

/** `GET /admin/features` — optionally filtered by status. Returns a plain array (no pagination). */
export async function fetchFeatureList(status?: CmsFeatureStatus): Promise<CmsFeature[]> {
  const response = await apiClient.get<CmsFeature[]>("/features", {
    params: status ? { status } : undefined,
  });
  return response.data;
}

/** `GET /admin/features/:id`. Rejects with a `not-found` `ApiError` (see `lib/apiError.ts`) for a bad id. */
export async function fetchFeatureById(id: string): Promise<CmsFeature> {
  const response = await apiClient.get<CmsFeature>(`/features/${id}`);
  return response.data;
}

/** `POST /admin/features`. New Features are always created as `draft` server-side (`FeaturesService.create`). */
export async function createFeature(payload: CreateFeaturePayload): Promise<CmsFeature> {
  const response = await apiClient.post<CmsFeature>("/features", payload);
  return response.data;
}

/** `PATCH /admin/features/:id`. Does not touch `status` — see `updateFeatureStatus` for that. */
export async function updateFeature(
  id: string,
  payload: UpdateFeaturePayload,
): Promise<CmsFeature> {
  const response = await apiClient.patch<CmsFeature>(`/features/${id}`, payload);
  return response.data;
}

/** `DELETE /admin/features/:id`. Hard delete — there is no archive/restore step before this. */
export async function deleteFeature(id: string): Promise<void> {
  await apiClient.delete(`/features/${id}`);
}

/**
 * `PATCH /admin/features/:id/status`. Gated server-side behind
 * `content:publish` (`FeaturesController.updateStatus`), separately
 * from plain field edits (`content:write`) — the two are kept as
 * separate calls here for that reason, not merged into `updateFeature`.
 */
export async function updateFeatureStatus(
  id: string,
  status: CmsFeatureStatus,
): Promise<CmsFeature> {
  const response = await apiClient.patch<CmsFeature>(`/features/${id}/status`, { status });
  return response.data;
}

/**
 * `PATCH /admin/features/reorder`. Writes `position` for exactly the
 * ids given, in that order (`OrderingService.reorder`) — callers must
 * pass the FULL ordered array of ids for the site's Features list,
 * never a filtered subset, or every id left out keeps its old
 * `position` and ends up interleaved incorrectly with the reordered
 * ones.
 */
export async function reorderFeatures(orderedIds: string[]): Promise<void> {
  await apiClient.patch("/features/reorder", { orderedIds });
}

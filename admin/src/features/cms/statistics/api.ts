import { apiClient } from "@/lib/apiClient";

import type {
  CmsStatistic,
  CmsStatisticStatus,
  CreateStatisticPayload,
  UpdateStatisticPayload,
} from "./types";

/**
 * Request functions for the CMS Admin Statistics endpoints
 * (`backend/src/modules/website/content/statistics/statistics.controller.ts`,
 * `@Controller('admin/statistics')`).
 *
 * Only this file is aware of the `/statistics` URLs — callers use these
 * functions, never `apiClient` directly (same convention as
 * `features/cms/features/api.ts`). Paths are bare (`/statistics`, not
 * `/admin/statistics`) because `apiClient`'s base URL already points at
 * `.../admin` (see `lib/env.ts`).
 *
 * No pagination/search params: `GET /admin/statistics` only supports an
 * optional `status` filter today (`StatisticsController.findAll`) —
 * nothing here should invent query params the backend doesn't read.
 */

/** `GET /admin/statistics` — optionally filtered by status. Returns a plain array (no pagination). */
export async function fetchStatisticList(
  status?: CmsStatisticStatus,
): Promise<CmsStatistic[]> {
  const response = await apiClient.get<CmsStatistic[]>("/statistics", {
    params: status ? { status } : undefined,
  });
  return response.data;
}

/** `GET /admin/statistics/:id`. Rejects with a `not-found` `ApiError` (see `lib/apiError.ts`) for a bad id. */
export async function fetchStatisticById(id: string): Promise<CmsStatistic> {
  const response = await apiClient.get<CmsStatistic>(`/statistics/${id}`);
  return response.data;
}

/** `POST /admin/statistics`. New Statistics are always created as `draft` server-side (`StatisticsService.create`). */
export async function createStatistic(
  payload: CreateStatisticPayload,
): Promise<CmsStatistic> {
  const response = await apiClient.post<CmsStatistic>("/statistics", payload);
  return response.data;
}

/** `PATCH /admin/statistics/:id`. Does not touch `status` — see `updateStatisticStatus` for that. */
export async function updateStatistic(
  id: string,
  payload: UpdateStatisticPayload,
): Promise<CmsStatistic> {
  const response = await apiClient.patch<CmsStatistic>(`/statistics/${id}`, payload);
  return response.data;
}

/** `DELETE /admin/statistics/:id`. Hard delete — there is no archive/restore step before this. */
export async function deleteStatistic(id: string): Promise<void> {
  await apiClient.delete(`/statistics/${id}`);
}

/**
 * `PATCH /admin/statistics/:id/status`. Gated server-side behind
 * `content:publish` (`StatisticsController.updateStatus`), separately
 * from plain field edits (`content:write`) — the two are kept as
 * separate calls here for that reason, not merged into `updateStatistic`.
 */
export async function updateStatisticStatus(
  id: string,
  status: CmsStatisticStatus,
): Promise<CmsStatistic> {
  const response = await apiClient.patch<CmsStatistic>(`/statistics/${id}/status`, {
    status,
  });
  return response.data;
}

/**
 * `PATCH /admin/statistics/reorder`. Writes `position` for exactly the
 * ids given, in that order (`OrderingService.reorder`) — callers must
 * pass the FULL ordered array of ids for the site's Statistics list,
 * never a filtered subset, or every id left out keeps its old
 * `position` and ends up interleaved incorrectly with the reordered
 * ones.
 */
export async function reorderStatistics(orderedIds: string[]): Promise<void> {
  await apiClient.patch("/statistics/reorder", { orderedIds });
}

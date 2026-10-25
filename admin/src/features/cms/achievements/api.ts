import { apiClient } from "@/lib/apiClient";

import type {
  CmsAchievement,
  CmsAchievementStatus,
  CreateAchievementPayload,
  UpdateAchievementPayload,
} from "./types";

/**
 * Request functions for the CMS Admin Achievements endpoints
 * (`@Controller('admin/achievements')`).
 *
 * Only this file is aware of the `/achievements` URLs — callers use
 * these functions, never `apiClient` directly. Paths are bare
 * (`/achievements`, not `/admin/achievements`) because `apiClient`'s base
 * URL already points at `.../admin`.
 */

/** `GET /admin/achievements` — optionally filtered by status. Plain array (no pagination). */
export async function fetchAchievementList(
  status?: CmsAchievementStatus,
): Promise<CmsAchievement[]> {
  const response = await apiClient.get<CmsAchievement[]>("/achievements", {
    params: status ? { status } : undefined,
  });
  return response.data;
}

/** `GET /admin/achievements/:id`. */
export async function fetchAchievementById(id: string): Promise<CmsAchievement> {
  const response = await apiClient.get<CmsAchievement>(`/achievements/${id}`);
  return response.data;
}

/** `POST /admin/achievements`. New rows are always created as `draft` server-side. */
export async function createAchievement(
  payload: CreateAchievementPayload,
): Promise<CmsAchievement> {
  const response = await apiClient.post<CmsAchievement>("/achievements", payload);
  return response.data;
}

/** `PATCH /admin/achievements/:id`. Does not touch `status`. */
export async function updateAchievement(
  id: string,
  payload: UpdateAchievementPayload,
): Promise<CmsAchievement> {
  const response = await apiClient.patch<CmsAchievement>(`/achievements/${id}`, payload);
  return response.data;
}

/** `DELETE /admin/achievements/:id`. Hard delete. */
export async function deleteAchievement(id: string): Promise<void> {
  await apiClient.delete(`/achievements/${id}`);
}

/** `PATCH /admin/achievements/:id/status`. Gated server-side behind `content:publish`. */
export async function updateAchievementStatus(
  id: string,
  status: CmsAchievementStatus,
): Promise<CmsAchievement> {
  const response = await apiClient.patch<CmsAchievement>(`/achievements/${id}/status`, {
    status,
  });
  return response.data;
}

/**
 * `PATCH /admin/achievements/reorder`. Writes `position` for exactly the
 * ids given, in that order — callers must pass the FULL ordered array of
 * ids for the site, never a filtered subset.
 */
export async function reorderAchievements(orderedIds: string[]): Promise<void> {
  await apiClient.patch("/achievements/reorder", { orderedIds });
}

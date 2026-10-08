import { apiClient } from "@/lib/apiClient";

import type {
  CmsCampus,
  CmsCampusRevision,
  CmsCampusStatus,
  CreateCampusPayload,
  ScheduleCampusPayload,
  UpdateCampusPayload,
} from "./types";

/**
 * Request functions for the CMS Admin Campuses endpoints
 * (`backend/src/modules/website/content/campuses/campuses.controller.ts`,
 * `@Controller('admin/campuses')`).
 *
 * Only this file is aware of the `/campuses` URLs — callers use these
 * functions, never `apiClient` directly (same convention as
 * `features/cms/teachers/api.ts`). Paths are bare (`/campuses`, not
 * `/admin/campuses`) because `apiClient`'s base URL already points at
 * `.../admin` (see `lib/env.ts`).
 *
 * No pagination/category params: `GET /admin/campuses` only supports
 * the optional `status` filter `CampusesController.findAll` reads —
 * nothing here should invent query params the backend doesn't read.
 */

/** `GET /admin/campuses` — optionally filtered by status. Returns a plain array (no pagination), sorted by `position` ASC server-side. */
export async function fetchCampusesList(status?: CmsCampusStatus): Promise<CmsCampus[]> {
  const response = await apiClient.get<CmsCampus[]>("/campuses", {
    params: status ? { status } : undefined,
  });
  return response.data;
}

/** `GET /admin/campuses/:id`. Rejects with a `not-found` `ApiError` (see `lib/apiError.ts`) for a bad id. */
export async function fetchCampusById(id: string): Promise<CmsCampus> {
  const response = await apiClient.get<CmsCampus>(`/campuses/${id}`);
  return response.data;
}

/** `POST /admin/campuses`. New campuses are always created as `draft` server-side (`CampusesService.create`), appended to the end of the current order. */
export async function createCampus(payload: CreateCampusPayload): Promise<CmsCampus> {
  const response = await apiClient.post<CmsCampus>("/campuses", payload);
  return response.data;
}

/** `PATCH /admin/campuses/:id`. Does not touch `status`/`publishAt`/`position` — see `updateCampusStatus`/`scheduleCampus`/`reorderCampuses` for those. */
export async function updateCampus(
  id: string,
  payload: UpdateCampusPayload,
): Promise<CmsCampus> {
  const response = await apiClient.patch<CmsCampus>(`/campuses/${id}`, payload);
  return response.data;
}

/**
 * `DELETE /admin/campuses/:id`. Hard delete — `CampusesService.remove`
 * also detaches the `MediaUsage` row for the featured image (if any),
 * but that's a server-side concern this call doesn't need to know
 * about.
 */
export async function deleteCampus(id: string): Promise<void> {
  await apiClient.delete(`/campuses/${id}`);
}

/**
 * `PATCH /admin/campuses/:id/status`. Gated server-side behind
 * `content:publish` (`CampusesController.updateStatus`), separately
 * from plain field edits (`content:write`) — the two are kept as
 * separate calls here for that reason, not merged into `updateCampus`.
 */
export async function updateCampusStatus(
  id: string,
  status: CmsCampusStatus,
): Promise<CmsCampus> {
  const response = await apiClient.patch<CmsCampus>(`/campuses/${id}/status`, { status });
  return response.data;
}

/**
 * `PATCH /admin/campuses/:id/schedule`. Distinct from `status` — gates
 * *when* a `published` campus's page actually becomes visible (see
 * the entity's own doc comment); gated server-side behind the same
 * `content:publish` permission as status changes, same reasoning as
 * `CampusesController.schedule`.
 */
export async function scheduleCampus(
  id: string,
  payload: ScheduleCampusPayload,
): Promise<CmsCampus> {
  const response = await apiClient.patch<CmsCampus>(`/campuses/${id}/schedule`, payload);
  return response.data;
}

/**
 * `PATCH /admin/campuses/reorder`. Writes `position` for exactly the
 * ids given, in that order (`OrderingService.reorder`) — callers must
 * pass the FULL ordered array of ids for the site's campus list, never
 * a filtered subset, or every id left out keeps its old `position` and
 * ends up interleaved incorrectly with the reordered ones. Same
 * convention as `features/cms/teachers/api.ts`'s `reorderTeachers`.
 */
export async function reorderCampuses(orderedIds: string[]): Promise<void> {
  await apiClient.patch("/campuses/reorder", { orderedIds });
}

/**
 * `GET /admin/campuses/:id/revisions`. Gated server-side behind
 * `website.revisions:view` (`CampusesController.listRevisions`).
 * Returned newest-first (`RevisionsService.list`'s own ordering).
 */
export async function fetchCampusRevisions(id: string): Promise<CmsCampusRevision[]> {
  const response = await apiClient.get<CmsCampusRevision[]>(`/campuses/${id}/revisions`);
  return response.data;
}

/**
 * `POST /admin/campuses/:id/revisions/:versionNumber/restore`. Gated
 * server-side behind `website.revisions:restore`
 * (`CampusesController.restoreRevision`) — a stricter permission than
 * `website.revisions:view`, since restoring overwrites the live
 * campus (as a new edit, which itself records a new revision —
 * non-destructive, per `RevisionsService`'s own doc comment).
 */
export async function restoreCampusRevision(
  id: string,
  versionNumber: number,
): Promise<CmsCampus> {
  const response = await apiClient.post<CmsCampus>(
    `/campuses/${id}/revisions/${versionNumber}/restore`,
  );
  return response.data;
}

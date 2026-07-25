import { apiClient } from "@/lib/apiClient";

import type {
  CmsTeacher,
  CmsTeacherRevision,
  CmsTeacherStatus,
  CreateTeacherPayload,
  ScheduleTeacherPayload,
  UpdateTeacherPayload,
} from "./types";

/**
 * Request functions for the CMS Admin Teachers endpoints
 * (`backend/src/modules/website/content/teachers/teachers.controller.ts`,
 * `@Controller('admin/teachers')`).
 *
 * Only this file is aware of the `/teachers` URLs — callers use these
 * functions, never `apiClient` directly (same convention as
 * `features/cms/events/api.ts`). Paths are bare (`/teachers`, not
 * `/admin/teachers`) because `apiClient`'s base URL already points at
 * `.../admin` (see `lib/env.ts`).
 *
 * No pagination/category params: `GET /admin/teachers` only supports
 * the optional `status` filter `TeachersController.findAll` reads —
 * nothing here should invent query params the backend doesn't read.
 */

/** `GET /admin/teachers` — optionally filtered by status. Returns a plain array (no pagination), sorted by `position` ASC server-side. */
export async function fetchTeachersList(status?: CmsTeacherStatus): Promise<CmsTeacher[]> {
  const response = await apiClient.get<CmsTeacher[]>("/teachers", {
    params: status ? { status } : undefined,
  });
  return response.data;
}

/** `GET /admin/teachers/:id`. Rejects with a `not-found` `ApiError` (see `lib/apiError.ts`) for a bad id. */
export async function fetchTeacherById(id: string): Promise<CmsTeacher> {
  const response = await apiClient.get<CmsTeacher>(`/teachers/${id}`);
  return response.data;
}

/** `POST /admin/teachers`. New teachers are always created as `draft` server-side (`TeachersService.create`), appended to the end of the current order. */
export async function createTeacher(payload: CreateTeacherPayload): Promise<CmsTeacher> {
  const response = await apiClient.post<CmsTeacher>("/teachers", payload);
  return response.data;
}

/** `PATCH /admin/teachers/:id`. Does not touch `status`/`publishAt`/`position` — see `updateTeacherStatus`/`scheduleTeacher`/`reorderTeachers` for those. */
export async function updateTeacher(
  id: string,
  payload: UpdateTeacherPayload,
): Promise<CmsTeacher> {
  const response = await apiClient.patch<CmsTeacher>(`/teachers/${id}`, payload);
  return response.data;
}

/**
 * `DELETE /admin/teachers/:id`. Hard delete — `TeachersService.remove`
 * also detaches the `MediaUsage` row for the avatar (if any), but
 * that's a server-side concern this call doesn't need to know about.
 */
export async function deleteTeacher(id: string): Promise<void> {
  await apiClient.delete(`/teachers/${id}`);
}

/**
 * `PATCH /admin/teachers/:id/status`. Gated server-side behind
 * `content:publish` (`TeachersController.updateStatus`), separately
 * from plain field edits (`content:write`) — the two are kept as
 * separate calls here for that reason, not merged into `updateTeacher`.
 */
export async function updateTeacherStatus(
  id: string,
  status: CmsTeacherStatus,
): Promise<CmsTeacher> {
  const response = await apiClient.patch<CmsTeacher>(`/teachers/${id}/status`, { status });
  return response.data;
}

/**
 * `PATCH /admin/teachers/:id/schedule`. Distinct from `status` — gates
 * *when* a `published` teacher's page actually becomes visible (see
 * the entity's own doc comment); gated server-side behind the same
 * `content:publish` permission as status changes, same reasoning as
 * `TeachersController.schedule`.
 */
export async function scheduleTeacher(
  id: string,
  payload: ScheduleTeacherPayload,
): Promise<CmsTeacher> {
  const response = await apiClient.patch<CmsTeacher>(`/teachers/${id}/schedule`, payload);
  return response.data;
}

/**
 * `PATCH /admin/teachers/reorder`. Writes `position` for exactly the
 * ids given, in that order (`OrderingService.reorder`) — callers must
 * pass the FULL ordered array of ids for the site's teacher list, never
 * a filtered subset, or every id left out keeps its old `position` and
 * ends up interleaved incorrectly with the reordered ones. Same
 * convention as `features/cms/faq/api.ts`'s `reorderFaqs`.
 */
export async function reorderTeachers(orderedIds: string[]): Promise<void> {
  await apiClient.patch("/teachers/reorder", { orderedIds });
}

/**
 * `GET /admin/teachers/:id/revisions`. Gated server-side behind
 * `website.revisions:view` (`TeachersController.listRevisions`).
 * Returned newest-first (`RevisionsService.list`'s own ordering).
 */
export async function fetchTeacherRevisions(id: string): Promise<CmsTeacherRevision[]> {
  const response = await apiClient.get<CmsTeacherRevision[]>(`/teachers/${id}/revisions`);
  return response.data;
}

/**
 * `POST /admin/teachers/:id/revisions/:versionNumber/restore`. Gated
 * server-side behind `website.revisions:restore`
 * (`TeachersController.restoreRevision`) — a stricter permission than
 * `website.revisions:view`, since restoring overwrites the live
 * teacher (as a new edit, which itself records a new revision —
 * non-destructive, per `RevisionsService`'s own doc comment).
 */
export async function restoreTeacherRevision(
  id: string,
  versionNumber: number,
): Promise<CmsTeacher> {
  const response = await apiClient.post<CmsTeacher>(
    `/teachers/${id}/revisions/${versionNumber}/restore`,
  );
  return response.data;
}

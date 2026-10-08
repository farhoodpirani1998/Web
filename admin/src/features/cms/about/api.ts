import { apiClient } from "@/lib/apiClient";

import type {
  CmsAbout,
  CmsAboutRevision,
  CmsAboutStatus,
  UpdateAboutPayload,
} from "./types";

/**
 * Request functions for the CMS Admin About endpoints
 * (`backend/src/modules/website/content/about/about.controller.ts`,
 * `@Controller('admin/about')`).
 *
 * Only this file is aware of the `/about` URLs — callers use these
 * functions, never `apiClient` directly (same convention as
 * `features/cms/campuses/api.ts`). Paths are bare (`/about`, not
 * `/admin/about`) because `apiClient`'s base URL already points at
 * `.../admin` (see `lib/env.ts`).
 *
 * No `:id` anywhere, no list/create/delete: About is a singleton (see
 * `types.ts`'s top comment) — every route acts on the one row for the
 * default site.
 */

/** `GET /admin/about` — the singleton row, auto-seeded server-side (`AboutService.onModuleInit`). */
export async function fetchAbout(): Promise<CmsAbout> {
  const response = await apiClient.get<CmsAbout>("/about");
  return response.data;
}

/** `PATCH /admin/about`. Does not touch `status` — see `updateAboutStatus` for that. */
export async function updateAbout(payload: UpdateAboutPayload): Promise<CmsAbout> {
  const response = await apiClient.patch<CmsAbout>("/about", payload);
  return response.data;
}

/**
 * `PATCH /admin/about/status`. Gated server-side behind `content:publish`
 * (`AboutController.updateStatus`), separately from plain field edits
 * (`content:write`) — the two are kept as separate calls here for that
 * reason, not merged into `updateAbout`.
 */
export async function updateAboutStatus(status: CmsAboutStatus): Promise<CmsAbout> {
  const response = await apiClient.patch<CmsAbout>("/about/status", { status });
  return response.data;
}

/**
 * `GET /admin/about/revisions`. Gated server-side behind
 * `website.revisions:view` (`AboutController.listRevisions`). Returned
 * newest-first (`RevisionsService.list`'s own ordering).
 */
export async function fetchAboutRevisions(): Promise<CmsAboutRevision[]> {
  const response = await apiClient.get<CmsAboutRevision[]>("/about/revisions");
  return response.data;
}

/**
 * `POST /admin/about/revisions/:versionNumber/restore`. Gated behind
 * `website.revisions:restore` (`AboutController.restoreRevision`) — a
 * stricter permission than plain edits. Restoring records a new
 * revision itself rather than deleting history (non-destructive, per
 * `RevisionsService`'s own doc comment).
 */
export async function restoreAboutRevision(versionNumber: number): Promise<CmsAbout> {
  const response = await apiClient.post<CmsAbout>(
    `/about/revisions/${versionNumber}/restore`,
  );
  return response.data;
}

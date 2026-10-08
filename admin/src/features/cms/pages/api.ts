import { apiClient } from "@/lib/apiClient";

import type {
  CmsPage,
  CmsPageRevision,
  CmsPageStatus,
  CreatePagePayload,
  SchedulePagePayload,
  SetPageHomepagePayload,
  UpdatePagePayload,
} from "./types";

/**
 * Request functions for the CMS Admin Pages endpoints
 * (`backend/src/modules/website/content/pages/pages.controller.ts`,
 * `@Controller('admin/pages')`). Same shape as `features/cms/news/api.ts`
 * — only this file is aware of the `/pages` URLs.
 *
 * No pagination/search params: `GET /admin/pages` only supports the
 * optional `status`/`parentId` filters `PagesController.findAll` reads.
 * No `/reorder` endpoint either — Pages has no `position` field (see
 * `types.ts`'s top comment).
 */

/** `GET /admin/pages` — optionally filtered by status and/or parent. Returns a plain array (no pagination). */
export async function fetchPagesList(
  status?: CmsPageStatus,
  parentId?: string,
): Promise<CmsPage[]> {
  const response = await apiClient.get<CmsPage[]>("/pages", {
    params: {
      ...(status ? { status } : {}),
      ...(parentId ? { parentId } : {}),
    },
  });
  return response.data;
}

/** `GET /admin/pages/:id`. Rejects with a `not-found` `ApiError` (see `lib/apiError.ts`) for a bad id. */
export async function fetchPageById(id: string): Promise<CmsPage> {
  const response = await apiClient.get<CmsPage>(`/pages/${id}`);
  return response.data;
}

/** `POST /admin/pages`. New pages are always created as `draft` server-side (`PagesService.create`). */
export async function createPage(payload: CreatePagePayload): Promise<CmsPage> {
  const response = await apiClient.post<CmsPage>("/pages", payload);
  return response.data;
}

/**
 * `PATCH /admin/pages/:id`. Does not touch `status`/`publishAt`/
 * `isHomepage` — see `updatePageStatus`/`schedulePage`/`setPageHomepage`
 * for those (same split as News' dedicated action endpoints).
 */
export async function updatePage(id: string, payload: UpdatePagePayload): Promise<CmsPage> {
  const response = await apiClient.patch<CmsPage>(`/pages/${id}`, payload);
  return response.data;
}

/**
 * `DELETE /admin/pages/:id`. Unlike News, this can reject with a 409
 * (`ConflictException`) when the page still has child pages — the
 * caller (`PageDeleteConfirm`) surfaces that `ApiError` message as-is
 * rather than assuming delete always succeeds.
 */
export async function deletePage(id: string): Promise<void> {
  await apiClient.delete(`/pages/${id}`);
}

/** `PATCH /admin/pages/:id/status`. Gated server-side behind `content:publish`, separately from plain field edits (`content:write`). */
export async function updatePageStatus(id: string, status: CmsPageStatus): Promise<CmsPage> {
  const response = await apiClient.patch<CmsPage>(`/pages/${id}/status`, { status });
  return response.data;
}

/**
 * `PATCH /admin/pages/:id/schedule`. Distinct from `status` — gates
 * *when* a `published` page actually becomes visible, identical idiom
 * to `scheduleNewsArticle`.
 */
export async function schedulePage(
  id: string,
  payload: SchedulePagePayload,
): Promise<CmsPage> {
  const response = await apiClient.patch<CmsPage>(`/pages/${id}/schedule`, payload);
  return response.data;
}

/**
 * `PATCH /admin/pages/:id/homepage`. Pages-only action — designates
 * (or clears) this page as the site's homepage. The backend only
 * accepts `isHomepage: true` when the page is already `published`
 * (`PagesService.setHomepage`); this function doesn't pre-validate
 * that client-side, it just relays whatever the backend decides via a
 * normal `ApiError`.
 */
export async function setPageHomepage(
  id: string,
  payload: SetPageHomepagePayload,
): Promise<CmsPage> {
  const response = await apiClient.patch<CmsPage>(`/pages/${id}/homepage`, payload);
  return response.data;
}

/** `GET /admin/pages/:id/revisions`. Gated server-side behind `website.revisions:view`. Returned newest-first. */
export async function fetchPageRevisions(id: string): Promise<CmsPageRevision[]> {
  const response = await apiClient.get<CmsPageRevision[]>(`/pages/${id}/revisions`);
  return response.data;
}

/**
 * `POST /admin/pages/:id/revisions/:versionNumber/restore`. Gated
 * server-side behind `website.revisions:restore`. Restoring a past
 * `parentId` re-runs the same existence/cycle validation as any other
 * edit (`PagesService.restoreRevision`'s own comment) — if that
 * ancestor no longer exists or would now form a cycle, the request
 * fails loudly via a normal `ApiError` rather than silently keeping
 * the current parent.
 */
export async function restorePageRevision(
  id: string,
  versionNumber: number,
): Promise<CmsPage> {
  const response = await apiClient.post<CmsPage>(
    `/pages/${id}/revisions/${versionNumber}/restore`,
  );
  return response.data;
}

import { apiClient } from "@/lib/apiClient";

import type {
  CmsNewsArticle,
  CmsNewsRevision,
  CmsNewsStatus,
  CreateNewsArticlePayload,
  ScheduleNewsArticlePayload,
  UpdateNewsArticlePayload,
} from "./types";

/**
 * Request functions for the CMS Admin News endpoints
 * (`backend/src/modules/website/content/news/news.controller.ts`,
 * `@Controller('admin/news')`).
 *
 * Only this file is aware of the `/news` URLs — callers use these
 * functions, never `apiClient` directly (same convention as
 * `features/cms/hero-slides/api.ts`). Paths are bare (`/news`, not
 * `/admin/news`) because `apiClient`'s base URL already points at
 * `.../admin` (see `lib/env.ts`).
 *
 * No pagination/search params: `GET /admin/news` only supports the
 * optional `status`/`category` filters `NewsController.findAll` reads
 * — nothing here should invent query params the backend doesn't read.
 * No `/reorder` endpoint either — News has no `position` field (see
 * `types.ts`'s top comment).
 */

/** `GET /admin/news` — optionally filtered by status and/or category. Returns a plain array (no pagination). */
export async function fetchNewsList(
  status?: CmsNewsStatus,
  category?: string,
): Promise<CmsNewsArticle[]> {
  const response = await apiClient.get<CmsNewsArticle[]>("/news", {
    params: {
      ...(status ? { status } : {}),
      ...(category ? { category } : {}),
    },
  });
  return response.data;
}

/** `GET /admin/news/:id`. Rejects with a `not-found` `ApiError` (see `lib/apiError.ts`) for a bad id. */
export async function fetchNewsArticleById(id: string): Promise<CmsNewsArticle> {
  const response = await apiClient.get<CmsNewsArticle>(`/news/${id}`);
  return response.data;
}

/** `POST /admin/news`. New articles are always created as `draft` server-side (`NewsService.create`). */
export async function createNewsArticle(
  payload: CreateNewsArticlePayload,
): Promise<CmsNewsArticle> {
  const response = await apiClient.post<CmsNewsArticle>("/news", payload);
  return response.data;
}

/** `PATCH /admin/news/:id`. Does not touch `status`/`publishAt` — see `updateNewsArticleStatus`/`scheduleNewsArticle` for those. */
export async function updateNewsArticle(
  id: string,
  payload: UpdateNewsArticlePayload,
): Promise<CmsNewsArticle> {
  const response = await apiClient.patch<CmsNewsArticle>(`/news/${id}`, payload);
  return response.data;
}

/**
 * `DELETE /admin/news/:id`. Hard delete — `NewsService.remove` also
 * detaches the `MediaUsage` row for the featured image (if any), but
 * that's a server-side concern this call doesn't need to know about.
 */
export async function deleteNewsArticle(id: string): Promise<void> {
  await apiClient.delete(`/news/${id}`);
}

/**
 * `PATCH /admin/news/:id/status`. Gated server-side behind
 * `content:publish` (`NewsController.updateStatus`), separately from
 * plain field edits (`content:write`) — the two are kept as separate
 * calls here for that reason, not merged into `updateNewsArticle`.
 */
export async function updateNewsArticleStatus(
  id: string,
  status: CmsNewsStatus,
): Promise<CmsNewsArticle> {
  const response = await apiClient.patch<CmsNewsArticle>(`/news/${id}/status`, { status });
  return response.data;
}

/**
 * `PATCH /admin/news/:id/schedule`. Distinct from `status` — gates
 * *when* a `published` article actually becomes visible (see the
 * entity's own doc comment); gated server-side behind the same
 * `content:publish` permission as status changes, same reasoning as
 * `NewsController.schedule`.
 */
export async function scheduleNewsArticle(
  id: string,
  payload: ScheduleNewsArticlePayload,
): Promise<CmsNewsArticle> {
  const response = await apiClient.patch<CmsNewsArticle>(`/news/${id}/schedule`, payload);
  return response.data;
}

/**
 * `GET /admin/news/:id/revisions`. Gated server-side behind
 * `website.revisions:view` (`NewsController.listRevisions`). Returned
 * newest-first (`RevisionsService.list`'s own ordering).
 */
export async function fetchNewsRevisions(id: string): Promise<CmsNewsRevision[]> {
  const response = await apiClient.get<CmsNewsRevision[]>(`/news/${id}/revisions`);
  return response.data;
}

/**
 * `POST /admin/news/:id/revisions/:versionNumber/restore`. Gated
 * server-side behind `website.revisions:restore`
 * (`NewsController.restoreRevision`) — a stricter permission than
 * `website.revisions:view`, since restoring overwrites the live
 * article (as a new edit, which itself records a new revision —
 * non-destructive, per `RevisionsService`'s own doc comment).
 */
export async function restoreNewsRevision(
  id: string,
  versionNumber: number,
): Promise<CmsNewsArticle> {
  const response = await apiClient.post<CmsNewsArticle>(
    `/news/${id}/revisions/${versionNumber}/restore`,
  );
  return response.data;
}

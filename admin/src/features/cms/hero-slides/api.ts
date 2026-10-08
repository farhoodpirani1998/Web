import { apiClient } from "@/lib/apiClient";

import type {
  CmsHeroSlide,
  CmsHeroSlideRevision,
  CmsHeroSlideStatus,
  CreateHeroSlidePayload,
  UpdateHeroSlidePayload,
} from "./types";

/**
 * Request functions for the CMS Admin Hero Slides endpoints
 * (`backend/src/modules/website/content/hero/hero.controller.ts`,
 * `@Controller('admin/hero-slides')`).
 *
 * Only this file is aware of the `/hero-slides` URLs — callers use
 * these functions, never `apiClient` directly (same convention as
 * `features/cms/gallery/api.ts`). Paths are bare (`/hero-slides`, not
 * `/admin/hero-slides`) because `apiClient`'s base URL already points
 * at `.../admin` (see `lib/env.ts`).
 *
 * No pagination/search params: `GET /admin/hero-slides` only supports
 * an optional `status` filter today (`HeroController.findAll`) —
 * nothing here should invent query params the backend doesn't read.
 */

/** `GET /admin/hero-slides` — optionally filtered by status. Returns a plain array (no pagination). */
export async function fetchHeroSlideList(status?: CmsHeroSlideStatus): Promise<CmsHeroSlide[]> {
  const response = await apiClient.get<CmsHeroSlide[]>("/hero-slides", {
    params: status ? { status } : undefined,
  });
  return response.data;
}

/** `GET /admin/hero-slides/:id`. Rejects with a `not-found` `ApiError` (see `lib/apiError.ts`) for a bad id. */
export async function fetchHeroSlideById(id: string): Promise<CmsHeroSlide> {
  const response = await apiClient.get<CmsHeroSlide>(`/hero-slides/${id}`);
  return response.data;
}

/** `POST /admin/hero-slides`. New slides are always created as `draft` server-side (`HeroService.create`). */
export async function createHeroSlide(payload: CreateHeroSlidePayload): Promise<CmsHeroSlide> {
  const response = await apiClient.post<CmsHeroSlide>("/hero-slides", payload);
  return response.data;
}

/** `PATCH /admin/hero-slides/:id`. Does not touch `status` — see `updateHeroSlideStatus` for that. */
export async function updateHeroSlide(
  id: string,
  payload: UpdateHeroSlidePayload,
): Promise<CmsHeroSlide> {
  const response = await apiClient.patch<CmsHeroSlide>(`/hero-slides/${id}`, payload);
  return response.data;
}

/**
 * `DELETE /admin/hero-slides/:id`. Hard delete — `HeroService.remove`
 * also detaches the `MediaUsage` row for the background image (if
 * any), but that's a server-side concern this call doesn't need to
 * know about.
 */
export async function deleteHeroSlide(id: string): Promise<void> {
  await apiClient.delete(`/hero-slides/${id}`);
}

/**
 * `PATCH /admin/hero-slides/:id/status`. Gated server-side behind
 * `content:publish` (`HeroController.updateStatus`), separately from
 * plain field edits (`content:write`) — the two are kept as separate
 * calls here for that reason, not merged into `updateHeroSlide`.
 */
export async function updateHeroSlideStatus(
  id: string,
  status: CmsHeroSlideStatus,
): Promise<CmsHeroSlide> {
  const response = await apiClient.patch<CmsHeroSlide>(`/hero-slides/${id}/status`, { status });
  return response.data;
}

/**
 * `PATCH /admin/hero-slides/reorder`. Writes `position` for exactly
 * the ids given, in that order (`OrderingService.reorder`) — callers
 * must pass the FULL ordered array of ids for the site's hero slide
 * list, never a filtered subset, or every id left out keeps its old
 * `position` and ends up interleaved incorrectly with the reordered
 * ones.
 */
export async function reorderHeroSlides(orderedIds: string[]): Promise<void> {
  await apiClient.patch("/hero-slides/reorder", { orderedIds });
}

/**
 * `GET /admin/hero-slides/:id/revisions`. Gated server-side behind
 * `website.revisions:view` (`HeroController.listRevisions`). Returned
 * newest-first (`RevisionsService.list`'s own ordering).
 */
export async function fetchHeroSlideRevisions(id: string): Promise<CmsHeroSlideRevision[]> {
  const response = await apiClient.get<CmsHeroSlideRevision[]>(`/hero-slides/${id}/revisions`);
  return response.data;
}

/**
 * `POST /admin/hero-slides/:id/revisions/:versionNumber/restore`.
 * Gated server-side behind `website.revisions:restore`
 * (`HeroController.restoreRevision`) — a stricter permission than
 * `website.revisions:view`, since restoring overwrites the live slide
 * (as a new edit, which itself records a new revision — non-destructive,
 * per `RevisionsService`'s own doc comment).
 */
export async function restoreHeroSlideRevision(
  id: string,
  versionNumber: number,
): Promise<CmsHeroSlide> {
  const response = await apiClient.post<CmsHeroSlide>(
    `/hero-slides/${id}/revisions/${versionNumber}/restore`,
  );
  return response.data;
}

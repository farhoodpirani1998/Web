import { apiClient } from "@/lib/apiClient";

import type { CmsPortalLink, CreatePortalLinkPayload, UpdatePortalLinkPayload } from "./types";

/**
 * Request functions for the CMS Admin Portal Links endpoints
 * (`backend/src/modules/website/content/site-settings/portal-links.controller.ts`,
 * `@Controller('admin/portal-links')`).
 *
 * Only this file is aware of the `/portal-links` URLs — callers use
 * these functions, never `apiClient` directly (same convention as
 * `features/cms/faq/api.ts`). Paths are bare (`/portal-links`, not
 * `/admin/portal-links`) because `apiClient`'s base URL already points
 * at `.../admin`.
 *
 * No pagination/search params: `GET /admin/portal-links` returns a
 * plain array with no filter support today — nothing here should
 * invent query params the backend doesn't read.
 */

/** `GET /admin/portal-links`. Returns the full ordered list — no pagination. */
export async function fetchPortalLinkList(): Promise<CmsPortalLink[]> {
  const response = await apiClient.get<CmsPortalLink[]>("/portal-links");
  return response.data;
}

/** `GET /admin/portal-links/:id`. Rejects with a `not-found` `ApiError` for a bad id. */
export async function fetchPortalLinkById(id: string): Promise<CmsPortalLink> {
  const response = await apiClient.get<CmsPortalLink>(`/portal-links/${id}`);
  return response.data;
}

/** `POST /admin/portal-links`. New links are appended at the end (`PortalLinksService.create`). */
export async function createPortalLink(payload: CreatePortalLinkPayload): Promise<CmsPortalLink> {
  const response = await apiClient.post<CmsPortalLink>("/portal-links", payload);
  return response.data;
}

/** `PATCH /admin/portal-links/:id`. */
export async function updatePortalLink(
  id: string,
  payload: UpdatePortalLinkPayload,
): Promise<CmsPortalLink> {
  const response = await apiClient.patch<CmsPortalLink>(`/portal-links/${id}`, payload);
  return response.data;
}

/** `DELETE /admin/portal-links/:id`. Hard delete — there is no archive/restore step before this. */
export async function deletePortalLink(id: string): Promise<void> {
  await apiClient.delete(`/portal-links/${id}`);
}

/**
 * `PATCH /admin/portal-links/reorder`. Writes `position` for exactly
 * the ids given, in that order (`OrderingService.reorder`) — callers
 * must pass the FULL ordered array of ids, never a filtered subset, or
 * every id left out keeps its old `position` and ends up interleaved
 * incorrectly with the reordered ones (same caveat as `reorderFaqs`).
 */
export async function reorderPortalLinks(orderedIds: string[]): Promise<void> {
  await apiClient.patch("/portal-links/reorder", { orderedIds });
}

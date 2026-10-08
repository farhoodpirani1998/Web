import { apiClient } from "@/lib/apiClient";

import type { CmsFaq, CmsFaqStatus, CreateFaqPayload, UpdateFaqPayload } from "./types";

/**
 * Request functions for the CMS Admin FAQ endpoints
 * (`backend/src/modules/website/content/faq/faq.controller.ts`,
 * `@Controller('admin/faqs')`).
 *
 * Only this file is aware of the `/faqs` URLs — callers use these
 * functions, never `apiClient` directly (same convention as
 * `features/cms/media/api.ts`). Paths are bare (`/faqs`, not
 * `/admin/faqs`) because `apiClient`'s base URL already points at
 * `.../admin` (see `lib/env.ts`).
 *
 * No pagination/search params: `GET /admin/faqs` only supports an
 * optional `status` filter today (`FaqController.findAll`) — nothing
 * here should invent query params the backend doesn't read.
 */

/** `GET /admin/faqs` — optionally filtered by status. Returns a plain array (no pagination). */
export async function fetchFaqList(status?: CmsFaqStatus): Promise<CmsFaq[]> {
  const response = await apiClient.get<CmsFaq[]>("/faqs", {
    params: status ? { status } : undefined,
  });
  return response.data;
}

/** `GET /admin/faqs/:id`. Rejects with a `not-found` `ApiError` (see `lib/apiError.ts`) for a bad id. */
export async function fetchFaqById(id: string): Promise<CmsFaq> {
  const response = await apiClient.get<CmsFaq>(`/faqs/${id}`);
  return response.data;
}

/** `POST /admin/faqs`. New FAQs are always created as `draft` server-side (`FaqService.create`). */
export async function createFaq(payload: CreateFaqPayload): Promise<CmsFaq> {
  const response = await apiClient.post<CmsFaq>("/faqs", payload);
  return response.data;
}

/** `PATCH /admin/faqs/:id`. Does not touch `status` — see `updateFaqStatus` for that. */
export async function updateFaq(id: string, payload: UpdateFaqPayload): Promise<CmsFaq> {
  const response = await apiClient.patch<CmsFaq>(`/faqs/${id}`, payload);
  return response.data;
}

/** `DELETE /admin/faqs/:id`. Hard delete — there is no archive/restore step before this. */
export async function deleteFaq(id: string): Promise<void> {
  await apiClient.delete(`/faqs/${id}`);
}

/**
 * `PATCH /admin/faqs/:id/status`. Gated server-side behind
 * `content:publish` (`FaqController.updateStatus`), separately from
 * plain field edits (`content:write`) — the two are kept as separate
 * calls here for that reason, not merged into `updateFaq`.
 */
export async function updateFaqStatus(id: string, status: CmsFaqStatus): Promise<CmsFaq> {
  const response = await apiClient.patch<CmsFaq>(`/faqs/${id}/status`, { status });
  return response.data;
}

/**
 * `PATCH /admin/faqs/reorder`. Writes `position` for exactly the ids
 * given, in that order (`OrderingService.reorder`) — callers must pass
 * the FULL ordered array of ids for the site's FAQ list, never a
 * filtered subset, or every id left out keeps its old `position` and
 * ends up interleaved incorrectly with the reordered ones.
 */
export async function reorderFaqs(orderedIds: string[]): Promise<void> {
  await apiClient.patch("/faqs/reorder", { orderedIds });
}

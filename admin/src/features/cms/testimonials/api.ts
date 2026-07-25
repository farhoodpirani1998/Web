import { apiClient } from "@/lib/apiClient";

import type {
  CmsTestimonial,
  CmsTestimonialStatus,
  CreateTestimonialPayload,
  UpdateTestimonialPayload,
} from "./types";

/**
 * Request functions for the CMS Admin Testimonials endpoints
 * (`backend/src/modules/website/content/testimonials/testimonials.controller.ts`,
 * `@Controller('admin/testimonials')`).
 *
 * Only this file is aware of the `/testimonials` URLs — callers use
 * these functions, never `apiClient` directly (same convention as
 * `features/cms/faq/api.ts`). Paths are bare (`/testimonials`, not
 * `/admin/testimonials`) because `apiClient`'s base URL already points
 * at `.../admin` (see `lib/env.ts`).
 *
 * No pagination/search params: `GET /admin/testimonials` only supports
 * an optional `status` filter today (`TestimonialsController.findAll`)
 * — nothing here should invent query params the backend doesn't read.
 */

/** `GET /admin/testimonials` — optionally filtered by status. Returns a plain array (no pagination). */
export async function fetchTestimonialList(
  status?: CmsTestimonialStatus,
): Promise<CmsTestimonial[]> {
  const response = await apiClient.get<CmsTestimonial[]>("/testimonials", {
    params: status ? { status } : undefined,
  });
  return response.data;
}

/** `GET /admin/testimonials/:id`. Rejects with a `not-found` `ApiError` (see `lib/apiError.ts`) for a bad id. */
export async function fetchTestimonialById(id: string): Promise<CmsTestimonial> {
  const response = await apiClient.get<CmsTestimonial>(`/testimonials/${id}`);
  return response.data;
}

/** `POST /admin/testimonials`. New testimonials are always created as `draft` server-side (`TestimonialsService.create`). */
export async function createTestimonial(
  payload: CreateTestimonialPayload,
): Promise<CmsTestimonial> {
  const response = await apiClient.post<CmsTestimonial>("/testimonials", payload);
  return response.data;
}

/** `PATCH /admin/testimonials/:id`. Does not touch `status` — see `updateTestimonialStatus` for that. */
export async function updateTestimonial(
  id: string,
  payload: UpdateTestimonialPayload,
): Promise<CmsTestimonial> {
  const response = await apiClient.patch<CmsTestimonial>(`/testimonials/${id}`, payload);
  return response.data;
}

/** `DELETE /admin/testimonials/:id`. Hard delete — there is no archive/restore step before this. */
export async function deleteTestimonial(id: string): Promise<void> {
  await apiClient.delete(`/testimonials/${id}`);
}

/**
 * `PATCH /admin/testimonials/:id/status`. Gated server-side behind
 * `content:publish` (`TestimonialsController.updateStatus`),
 * separately from plain field edits (`content:write`) — the two are
 * kept as separate calls here for that reason, not merged into
 * `updateTestimonial`.
 */
export async function updateTestimonialStatus(
  id: string,
  status: CmsTestimonialStatus,
): Promise<CmsTestimonial> {
  const response = await apiClient.patch<CmsTestimonial>(`/testimonials/${id}/status`, {
    status,
  });
  return response.data;
}

/**
 * `PATCH /admin/testimonials/reorder`. Writes `position` for exactly
 * the ids given, in that order (`OrderingService.reorder`) — callers
 * must pass the FULL ordered array of ids for the site's testimonial
 * list, never a filtered subset, or every id left out keeps its old
 * `position` and ends up interleaved incorrectly with the reordered
 * ones.
 */
export async function reorderTestimonials(orderedIds: string[]): Promise<void> {
  await apiClient.patch("/testimonials/reorder", { orderedIds });
}

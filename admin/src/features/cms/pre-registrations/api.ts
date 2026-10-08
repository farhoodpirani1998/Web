import { apiClient } from "@/lib/apiClient";

import type {
  CmsPreRegistration,
  CmsPreRegistrationStatus,
  UpdatePreRegistrationStatusPayload,
} from "./types";

/**
 * Request functions for the CMS Admin Pre-Registrations endpoints
 * (`backend/src/modules/website/content/pre-registrations/pre-registrations.controller.ts`,
 * `@Controller('admin/pre-registrations')`).
 *
 * Only this file is aware of the `/pre-registrations` URLs — callers use
 * these functions, never `apiClient` directly (same convention as
 * `features/cms/faq/api.ts`). Paths are bare (`/pre-registrations`, not
 * `/admin/pre-registrations`) because `apiClient`'s base URL already
 * points at `.../admin`.
 *
 * No `create`/`update` request functions: submissions only ever arrive
 * via the public site's own `POST /public/pre-registration` — this
 * admin surface only lists, reads, changes status, and deletes.
 *
 * No pagination/search params on the list: `GET /admin/pre-registrations`
 * returns a plain array (optionally filtered by `status`) — same
 * "plain array" convention every other admin list follows.
 */

export async function fetchPreRegistrationList(
  status?: CmsPreRegistrationStatus,
): Promise<CmsPreRegistration[]> {
  const response = await apiClient.get<CmsPreRegistration[]>("/pre-registrations", {
    params: status ? { status } : undefined,
  });
  return response.data;
}

/** `GET /admin/pre-registrations/:id`. Rejects with a `not-found` `ApiError` for a bad id. */
export async function fetchPreRegistrationById(id: string): Promise<CmsPreRegistration> {
  const response = await apiClient.get<CmsPreRegistration>(`/pre-registrations/${id}`);
  return response.data;
}

/** `PATCH /admin/pre-registrations/:id/status`. */
export async function updatePreRegistrationStatus(
  id: string,
  payload: UpdatePreRegistrationStatusPayload,
): Promise<CmsPreRegistration> {
  const response = await apiClient.patch<CmsPreRegistration>(
    `/pre-registrations/${id}/status`,
    payload,
  );
  return response.data;
}

/** `DELETE /admin/pre-registrations/:id`. Hard delete — there is no archive/restore step before this. */
export async function deletePreRegistration(id: string): Promise<void> {
  await apiClient.delete(`/pre-registrations/${id}`);
}

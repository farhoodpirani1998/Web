import { apiClient } from "@/lib/apiClient";

import type {
  CmsAdminUser,
  CreateAdminUserPayload,
  UpdateAdminUserPayload,
} from "./types";

/**
 * Request functions for the CMS Admin admin-users endpoints
 * (`@Controller('admin/admin-users')`) and the self-service password
 * change (`POST /admin/auth/change-password`). Only this file is aware of
 * the URLs; `apiClient`'s base URL already points at `.../admin`.
 */

/** `GET /admin/admin-users` — the full roster, oldest first. */
export async function fetchAdminUserList(): Promise<CmsAdminUser[]> {
  const response = await apiClient.get<CmsAdminUser[]>("/admin-users");
  return response.data;
}

/** `POST /admin/admin-users` — create a new admin (always active). */
export async function createAdminUser(
  payload: CreateAdminUserPayload,
): Promise<CmsAdminUser> {
  const response = await apiClient.post<CmsAdminUser>("/admin-users", payload);
  return response.data;
}

/** `PATCH /admin/admin-users/:id` — change role and/or active flag. */
export async function updateAdminUser(
  id: string,
  payload: UpdateAdminUserPayload,
): Promise<CmsAdminUser> {
  const response = await apiClient.patch<CmsAdminUser>(`/admin-users/${id}`, payload);
  return response.data;
}

/** `DELETE /admin/admin-users/:id`. */
export async function deleteAdminUser(id: string): Promise<void> {
  await apiClient.delete(`/admin-users/${id}`);
}

/** `POST /admin/auth/change-password` — self-service, requires the current password. */
export async function changeOwnPassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  await apiClient.post("/auth/change-password", { currentPassword, newPassword });
}

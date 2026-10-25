import { apiClient } from "@/lib/apiClient";

import type {
  AdmissionEntryKind,
  CmsAdmissionEntry,
  CmsAdmissionStatus,
  CreateAdmissionEntryPayload,
  UpdateAdmissionEntryPayload,
} from "./types";

/**
 * Request functions for the CMS Admin Admissions endpoints
 * (`@Controller('admin/admission-entries')`). Only this file is aware of
 * the URLs; `apiClient`'s base URL already points at `.../admin`.
 */

export async function fetchAdmissionEntryList(params?: {
  status?: CmsAdmissionStatus;
  kind?: AdmissionEntryKind;
}): Promise<CmsAdmissionEntry[]> {
  const response = await apiClient.get<CmsAdmissionEntry[]>("/admission-entries", {
    params: params && (params.status || params.kind) ? params : undefined,
  });
  return response.data;
}

export async function fetchAdmissionEntryById(id: string): Promise<CmsAdmissionEntry> {
  const response = await apiClient.get<CmsAdmissionEntry>(`/admission-entries/${id}`);
  return response.data;
}

export async function createAdmissionEntry(
  payload: CreateAdmissionEntryPayload,
): Promise<CmsAdmissionEntry> {
  const response = await apiClient.post<CmsAdmissionEntry>("/admission-entries", payload);
  return response.data;
}

export async function updateAdmissionEntry(
  id: string,
  payload: UpdateAdmissionEntryPayload,
): Promise<CmsAdmissionEntry> {
  const response = await apiClient.patch<CmsAdmissionEntry>(`/admission-entries/${id}`, payload);
  return response.data;
}

export async function deleteAdmissionEntry(id: string): Promise<void> {
  await apiClient.delete(`/admission-entries/${id}`);
}

export async function updateAdmissionEntryStatus(
  id: string,
  status: CmsAdmissionStatus,
): Promise<CmsAdmissionEntry> {
  const response = await apiClient.patch<CmsAdmissionEntry>(`/admission-entries/${id}/status`, {
    status,
  });
  return response.data;
}

export async function reorderAdmissionEntries(orderedIds: string[]): Promise<void> {
  await apiClient.patch("/admission-entries/reorder", { orderedIds });
}

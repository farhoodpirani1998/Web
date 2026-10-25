import { apiClient } from "@/lib/apiClient";

import type {
  AcademicCalendarEntryKind,
  CmsAcademicCalendarEntry,
  CmsAcademicCalendarStatus,
  CreateAcademicCalendarEntryPayload,
  UpdateAcademicCalendarEntryPayload,
} from "./types";

/**
 * Request functions for the CMS Admin Academic Calendar endpoints
 * (`@Controller('admin/academic-calendar-entries')`). Only this file is
 * aware of the URLs; `apiClient`'s base URL already points at `.../admin`.
 */

export async function fetchAcademicCalendarEntryList(params?: {
  status?: CmsAcademicCalendarStatus;
  kind?: AcademicCalendarEntryKind;
}): Promise<CmsAcademicCalendarEntry[]> {
  const response = await apiClient.get<CmsAcademicCalendarEntry[]>("/academic-calendar-entries", {
    params: params && (params.status || params.kind) ? params : undefined,
  });
  return response.data;
}

export async function fetchAcademicCalendarEntryById(id: string): Promise<CmsAcademicCalendarEntry> {
  const response = await apiClient.get<CmsAcademicCalendarEntry>(`/academic-calendar-entries/${id}`);
  return response.data;
}

export async function createAcademicCalendarEntry(
  payload: CreateAcademicCalendarEntryPayload,
): Promise<CmsAcademicCalendarEntry> {
  const response = await apiClient.post<CmsAcademicCalendarEntry>(
    "/academic-calendar-entries",
    payload,
  );
  return response.data;
}

export async function updateAcademicCalendarEntry(
  id: string,
  payload: UpdateAcademicCalendarEntryPayload,
): Promise<CmsAcademicCalendarEntry> {
  const response = await apiClient.patch<CmsAcademicCalendarEntry>(
    `/academic-calendar-entries/${id}`,
    payload,
  );
  return response.data;
}

export async function deleteAcademicCalendarEntry(id: string): Promise<void> {
  await apiClient.delete(`/academic-calendar-entries/${id}`);
}

export async function updateAcademicCalendarEntryStatus(
  id: string,
  status: CmsAcademicCalendarStatus,
): Promise<CmsAcademicCalendarEntry> {
  const response = await apiClient.patch<CmsAcademicCalendarEntry>(
    `/academic-calendar-entries/${id}/status`,
    { status },
  );
  return response.data;
}

export async function reorderAcademicCalendarEntries(orderedIds: string[]): Promise<void> {
  await apiClient.patch("/academic-calendar-entries/reorder", { orderedIds });
}

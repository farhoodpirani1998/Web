import { apiClient } from "@/lib/apiClient";

import type {
  CmsTextbook,
  CmsTextbookListResponse,
  CmsTextbookStatus,
  CmsTextbookTaxonomy,
  TextbookPayload,
} from "./types";

export async function fetchTextbooks(
  page = 1,
  limit = 20,
): Promise<CmsTextbookListResponse> {
  const response = await apiClient.get<CmsTextbookListResponse>("/textbooks", {
    params: { page, limit },
  });
  return response.data;
}

export async function fetchTextbookTaxonomies(): Promise<CmsTextbookTaxonomy[]> {
  const response = await apiClient.get<CmsTextbookTaxonomy[]>("/textbooks/taxonomies");
  return response.data;
}

export async function createTextbook(payload: TextbookPayload): Promise<CmsTextbook> {
  const response = await apiClient.post<CmsTextbook>("/textbooks", payload);
  return response.data;
}

export async function updateTextbook(
  id: string,
  payload: Partial<TextbookPayload>,
): Promise<CmsTextbook> {
  const response = await apiClient.patch<CmsTextbook>(`/textbooks/${id}`, payload);
  return response.data;
}

export async function updateTextbookStatus(
  id: string,
  status: CmsTextbookStatus,
): Promise<CmsTextbook> {
  const response = await apiClient.patch<CmsTextbook>(`/textbooks/${id}/status`, {
    status,
  });
  return response.data;
}

export async function uploadTextbook(id: string, file: File): Promise<CmsTextbook> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiClient.post<CmsTextbook>(
    `/textbooks/${id}/file`,
    formData,
  );
  return response.data;
}

export async function uploadTextbookCover(
  id: string,
  file: File,
): Promise<CmsTextbook> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiClient.post<CmsTextbook>(
    `/textbooks/${id}/cover`,
    formData,
  );
  return response.data;
}

export async function deleteTextbook(id: string): Promise<void> {
  await apiClient.delete(`/textbooks/${id}`);
}

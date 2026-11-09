import { apiClient } from "@/lib/apiClient";

import type {
  CmsTrustBadge,
  CmsTrustBadgeStatus,
  CreateTrustBadgePayload,
  UpdateTrustBadgePayload,
} from "./types";

export async function fetchTrustBadgeList(
  status?: CmsTrustBadgeStatus,
): Promise<CmsTrustBadge[]> {
  const response = await apiClient.get<CmsTrustBadge[]>("/trust-badges", {
    params: status ? { status } : undefined,
  });
  return response.data;
}

export async function createTrustBadge(
  payload: CreateTrustBadgePayload,
): Promise<CmsTrustBadge> {
  const response = await apiClient.post<CmsTrustBadge>(
    "/trust-badges",
    payload,
  );
  return response.data;
}

export async function updateTrustBadge(
  id: string,
  payload: UpdateTrustBadgePayload,
): Promise<CmsTrustBadge> {
  const response = await apiClient.patch<CmsTrustBadge>(
    `/trust-badges/${id}`,
    payload,
  );
  return response.data;
}

export async function deleteTrustBadge(id: string): Promise<void> {
  await apiClient.delete(`/trust-badges/${id}`);
}

export async function updateTrustBadgeStatus(
  id: string,
  status: CmsTrustBadgeStatus,
): Promise<CmsTrustBadge> {
  const response = await apiClient.patch<CmsTrustBadge>(
    `/trust-badges/${id}/status`,
    { status },
  );
  return response.data;
}

export async function reorderTrustBadges(orderedIds: string[]): Promise<void> {
  await apiClient.patch("/trust-badges/reorder", { orderedIds });
}

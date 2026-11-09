import { apiClient } from "@/shared/api";
import type { PublicTrustBadge } from "./types";

export async function fetchTrustBadges(): Promise<PublicTrustBadge[]> {
  const response = await apiClient.get<PublicTrustBadge[]>("/trust-badges");
  return response.data;
}

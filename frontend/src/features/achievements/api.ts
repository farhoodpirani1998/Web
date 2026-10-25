import { apiClient } from "@/shared/api";

import type { Achievements } from "./types";

/**
 * Request functions for the `achievements` feature's Public API endpoint.
 *
 * Per §14/§30, this is the only file in the `achievements` feature aware
 * of the endpoint's URL — `useAchievements` and any future consumer call
 * `fetchAchievements`, never `apiClient` directly.
 */
export async function fetchAchievements(): Promise<Achievements> {
  const response = await apiClient.get<Achievements>("/achievements");
  return response.data;
}

import { apiClient } from "@/shared/api";

import type { StatisticItem } from "./types";

/**
 * Request functions for the `statistics` feature's Public API
 * endpoint.
 *
 * Per §14/§30, this is the only file in the `statistics` feature aware
 * of the endpoint's URL — `useStatistics` and any future consumer call
 * `fetchStatistics`, never `apiClient` directly.
 */
export async function fetchStatistics(): Promise<readonly StatisticItem[]> {
  const response = await apiClient.get<readonly StatisticItem[]>("/statistics");
  return response.data;
}

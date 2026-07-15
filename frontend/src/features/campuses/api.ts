import { apiClient } from "@/shared/api";

import type { Campus } from "./types";

/**
 * Request functions for the `campuses` feature's Public API endpoint.
 *
 * Per §14/§30, this is the only file in the `campuses` feature aware
 * of the endpoint's URL — `useCampuses` and any future consumer call
 * `fetchCampuses`, never `apiClient` directly.
 */
export async function fetchCampuses(): Promise<readonly Campus[]> {
  const response = await apiClient.get<readonly Campus[]>("/campuses");
  return response.data;
}

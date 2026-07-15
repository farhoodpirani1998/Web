import { apiClient } from "@/shared/api";

import type { Features } from "./types";

/**
 * Request functions for the `features` feature's Public API endpoint.
 *
 * Per §14/§30, this is the only file in the `features` feature aware
 * of the endpoint's URL — `useFeatures` and any future consumer call
 * `fetchFeatures`, never `apiClient` directly.
 */
export async function fetchFeatures(): Promise<Features> {
  const response = await apiClient.get<Features>("/features");
  return response.data;
}

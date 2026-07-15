import { apiClient } from "@/shared/api";

import type { Navigation } from "./types";

/**
 * Request functions for the `navigation` feature's Public API endpoint.
 *
 * Per §14/§30, this is the only file in the `navigation` feature aware
 * of the endpoint's URL — `useNavigation` and any future consumer call
 * `fetchNavigation`, never `apiClient` directly.
 */
export async function fetchNavigation(): Promise<Navigation> {
  const response = await apiClient.get<Navigation>("/navigation");
  return response.data;
}

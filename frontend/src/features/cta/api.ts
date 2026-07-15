import { apiClient } from "@/shared/api";

import type { CTA } from "./types";

/**
 * Request functions for the `cta` feature's Public API endpoint.
 *
 * Per §14/§30, this is the only file in the `cta` feature aware of the
 * endpoint's URL — `useCTA` and any future consumer call `fetchCTA`,
 * never `apiClient` directly.
 */
export async function fetchCTA(): Promise<CTA> {
  const response = await apiClient.get<CTA>("/cta");
  return response.data;
}

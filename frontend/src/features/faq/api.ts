import { apiClient } from "@/shared/api";

import type { Faq } from "./types";

/**
 * Request functions for the `faq` feature's Public API endpoint.
 *
 * Per §14/§30, this is the only file in the `faq` feature aware of the
 * endpoint's URL — `useFaq` and any future consumer call `fetchFaq`,
 * never `apiClient` directly.
 */
export async function fetchFaq(): Promise<Faq> {
  const response = await apiClient.get<Faq>("/faq");
  return response.data;
}

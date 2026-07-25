import { apiClient } from "@/shared/api";

import type { PreRegistrationPayload } from "./types";

/**
 * Request function for the `pre-registration` feature's Public API
 * endpoint. Per §14/§30, this is the only file in the feature aware of
 * the endpoint's URL — `RegistrationForm` calls `submitPreRegistration`,
 * never `apiClient` directly.
 *
 * `POST /public/pre-registration` (`PublicPreRegistrationController`).
 * Unlike every other request function in this app, this is a write,
 * not a cached read — no query-layer caching applies here.
 */
export async function submitPreRegistration(
  payload: PreRegistrationPayload,
): Promise<{ id: string }> {
  const response = await apiClient.post<{ id: string }>("/pre-registration", payload);
  return response.data;
}

import { apiClient } from "@/shared/api";

import type { Testimonials } from "./types";

/**
 * Request functions for the `testimonials` feature's Public API endpoint.
 *
 * Per §14/§30, this is the only file in the `testimonials` feature aware
 * of the endpoint's URL — `useTestimonials` and any future consumer call
 * `fetchTestimonials`, never `apiClient` directly.
 *
 * The endpoint returns a flat, position-ordered array (no pagination
 * envelope). It is gated by `featureFlags.testimonialsEnabled`
 * server-side — the controller returns `[]` when the flag is off, so a
 * disabled section simply renders nothing rather than needing a
 * client-side flag check.
 */
export async function fetchTestimonials(): Promise<Testimonials> {
  const response = await apiClient.get<Testimonials>("/testimonials");
  return response.data;
}

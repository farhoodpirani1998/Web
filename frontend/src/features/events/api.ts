import { apiClient } from "@/shared/api";

import type { Event } from "./types";

/**
 * Request functions for the `events` feature's Public API endpoint.
 *
 * Per §14/§30, this is the only file in the `events` feature aware of
 * the endpoint's URL — `useEvents` and any future consumer call
 * `fetchEvents`, never `apiClient` directly.
 */
export async function fetchEvents(): Promise<readonly Event[]> {
  const response = await apiClient.get<readonly Event[]>("/events");
  return response.data;
}

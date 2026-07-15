import { apiClient } from "@/shared/api";

import type { Hero } from "./types";

/**
 * Request functions for the `hero` feature's Public API endpoint.
 *
 * Per §14/§30, this is the only file in the `hero` feature aware of the
 * endpoint's URL — `useHero` and any future consumer call `fetchHero`,
 * never `apiClient` directly.
 */
export async function fetchHero(): Promise<Hero> {
  const response = await apiClient.get<Hero>("/hero");
  return response.data;
}

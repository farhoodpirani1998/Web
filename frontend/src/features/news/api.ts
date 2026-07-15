import { apiClient } from "@/shared/api";

import type { NewsItem } from "./types";

/**
 * Request functions for the `news` feature's Public API endpoint.
 *
 * Per §14/§30, this is the only file in the `news` feature aware of
 * the endpoint's URL — `useNews` and any future consumer call
 * `fetchNews`, never `apiClient` directly. Assumed newest-first, the
 * same ordering `./data`'s placeholder array already uses.
 */
export async function fetchNews(): Promise<readonly NewsItem[]> {
  const response = await apiClient.get<readonly NewsItem[]>("/news");
  return response.data;
}

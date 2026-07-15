import { apiClient } from "@/shared/api";

import type { AboutPageContent } from "./types";

/**
 * Request functions for the `about` feature's Public API endpoint.
 *
 * Per §14/§30, this is the only file in the `about` feature aware of
 * the endpoint's URL — `useAboutPage` and any future consumer call
 * `fetchAboutPage`, never `apiClient` directly.
 */
export async function fetchAboutPage(): Promise<AboutPageContent> {
  const response = await apiClient.get<AboutPageContent>("/about");
  return response.data;
}

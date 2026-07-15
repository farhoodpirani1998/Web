import { apiClient } from "@/shared/api";

import type { SiteSettings } from "./types";

/**
 * Request functions for the `site` feature's Public API endpoint.
 *
 * Per §14/§30, this is the only file in the `site` feature aware of the
 * endpoint's URL — `useSiteSettings` and any future consumer call
 * `fetchSiteSettings`, never `apiClient` directly.
 */
export async function fetchSiteSettings(): Promise<SiteSettings> {
  const response = await apiClient.get<SiteSettings>("/site-settings");
  return response.data;
}

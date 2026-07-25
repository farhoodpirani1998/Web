import { apiClient } from "@/lib/apiClient";

import type {
  CmsSiteSettings,
  UpdateContactSettingsPayload,
  UpdateFeatureFlagsPayload,
  UpdateGeneralSettingsPayload,
  UpdateSocialLinksPayload,
} from "./types";

/**
 * Request functions for the CMS Admin Site Settings endpoints
 * (`backend/src/modules/website/content/site-settings/site-settings.controller.ts`,
 * `@Controller('admin/site-settings')`).
 *
 * Only this file is aware of the `/site-settings` URLs — callers use
 * these functions, never `apiClient` directly (same convention as
 * `features/cms/faq/api.ts` / `features/cms/media/api.ts`). Paths are
 * bare (`/site-settings`, not `/admin/site-settings`) because
 * `apiClient`'s base URL already points at `.../admin`.
 *
 * No `updateSeoSettings` here even though the backend controller has a
 * `PATCH /site-settings/seo` endpoint — it's gated behind
 * `website.seo:manage`, and no CMS admin page implements a form for it
 * yet. Add it alongside a real SEO form when that's actually in scope,
 * not speculatively here.
 */

/** `GET /admin/site-settings`. Singleton — no id, always returns the one row. */
export async function fetchSiteSettings(): Promise<CmsSiteSettings> {
  const response = await apiClient.get<CmsSiteSettings>("/site-settings");
  return response.data;
}

/** `PATCH /admin/site-settings/general`. */
export async function updateGeneralSettings(
  payload: UpdateGeneralSettingsPayload,
): Promise<CmsSiteSettings> {
  const response = await apiClient.patch<CmsSiteSettings>("/site-settings/general", payload);
  return response.data;
}

/** `PATCH /admin/site-settings/contact`. */
export async function updateContactSettings(
  payload: UpdateContactSettingsPayload,
): Promise<CmsSiteSettings> {
  const response = await apiClient.patch<CmsSiteSettings>("/site-settings/contact", payload);
  return response.data;
}

/**
 * `PATCH /admin/site-settings/social`. Sends the FULL desired
 * `socialLinks` array — the backend replaces the array wholesale, it
 * does not merge/patch individual entries.
 */
export async function updateSocialLinks(
  payload: UpdateSocialLinksPayload,
): Promise<CmsSiteSettings> {
  const response = await apiClient.patch<CmsSiteSettings>("/site-settings/social", payload);
  return response.data;
}

/**
 * `PATCH /admin/site-settings/feature-flags`. Gated server-side behind
 * `website.feature_flags:manage` (`SiteSettingsController.updateFeatureFlags`)
 * — a separate permission from `content:write`, so `FeatureFlagsSection`
 * gates its Save button on that permission specifically, not
 * `content:write` like the other sections.
 */
export async function updateFeatureFlags(
  payload: UpdateFeatureFlagsPayload,
): Promise<CmsSiteSettings> {
  const response = await apiClient.patch<CmsSiteSettings>("/site-settings/feature-flags", payload);
  return response.data;
}

/**
 * Public surface of the `cms/site-settings` feature.
 *
 * Other layers (pages, other CMS modules) should import from here
 * rather than reaching into `./api`, `./hooks/useSiteSettings`, etc.
 * directly — same convention as `features/cms/faq/index.ts` /
 * `features/cms/media/index.ts`.
 */
export type {
  CmsSeoMetadata,
  CmsSiteFeatureFlags,
  CmsSiteSettings,
  CmsSocialLink,
  CmsSocialPlatform,
  UpdateContactSettingsPayload,
  UpdateFeatureFlagsPayload,
  UpdateGeneralSettingsPayload,
  UpdateSocialLinksPayload,
} from "./types";
export {
  fetchSiteSettings,
  updateContactSettings,
  updateFeatureFlags,
  updateGeneralSettings,
  updateSocialLinks,
} from "./api";
export { useSiteSettings, type UseSiteSettingsResult } from "./hooks/useSiteSettings";

export { SiteSettingsPage } from "./SiteSettingsPage";
export { SettingsForm, type SettingsFormProps } from "./SettingsForm";

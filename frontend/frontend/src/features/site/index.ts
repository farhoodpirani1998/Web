/**
 * Public surface of the `site` feature (Site Settings).
 *
 * Per §30/§32 ("features never reach into another feature's
 * internals"), other layers (pages, other features) import these
 * section components only from here — never from the individual
 * section files directly.
 */
export { Brand } from "./Brand";
export { ContactInformation } from "./ContactInformation";
export { SocialLinks } from "./SocialLinks";
export { WorkingHours } from "./WorkingHours";
export { Copyright } from "./Copyright";
export { GeneralWebsiteInformation } from "./GeneralWebsiteInformation";

export { fetchSiteSettings } from "./api";
export { useSiteSettings, siteSettingsQueryKey } from "./useSiteSettings";
export type {
  SiteSettings,
  SiteSettingsBrand,
  SiteSettingsGeneralInfo,
  SiteSettingsContact,
  SiteSettingsSocialLink,
  SiteSettingsWorkingHoursRow,
  SiteSettingsCopyright,
} from "./types";

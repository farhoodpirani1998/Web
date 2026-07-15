/**
 * Public API response types for the backend's **Site Settings** content
 * module (Website Frontend Architecture §4, §8), consumed by the `site`
 * feature's data-fetching hook (`./api`, `./useSiteSettings`).
 *
 * These types describe the HTTP response contract only — they are
 * intentionally close to (but not the same file as) the section
 * components' current placeholder shapes in `./Brand.tsx`,
 * `./ContactInformation.tsx`, `./SocialLinks.tsx`, `./WorkingHours.tsx`,
 * `./GeneralWebsiteInformation.tsx`, and `./Copyright.tsx`. Wiring those
 * components to this data is a later phase (§ "no UI changes yet") —
 * this file only prepares the fetching layer.
 */

export interface SiteSettingsBrand {
  /** Site/organization display name. */
  name: string;
  /** Short tagline shown next to the brand mark, if configured. */
  tagline?: string;
  /** Logo asset URL; omitted while no Media module-backed value exists. */
  logoUrl?: string;
}

export interface SiteSettingsGeneralInfo {
  /** Longer descriptive copy about the site/organization. */
  description: string;
  /** Founding year, kept as a display string (locale-formatted digits). */
  foundedYear?: string;
  /** BCP-47-ish locale code, e.g. "fa" or "en". */
  defaultLocale: string;
  /** Publication status of the site as a whole. */
  status: "active" | "maintenance";
}

export interface SiteSettingsContact {
  address: string;
  phone: string;
  /** `tel:` deep link for `phone`. */
  phoneHref: string;
  fax?: string;
  email?: string;
  /** `mailto:` deep link for `email`. */
  emailHref?: string;
}

export interface SiteSettingsSocialLink {
  /** Stable identifier, e.g. "instagram", "telegram". */
  id: string;
  /** Human-readable platform label. */
  label: string;
  href: string;
}

export interface SiteSettingsWorkingHoursRow {
  /** Stable identifier, e.g. "sat-wed", "thu", "fri". */
  id: string;
  /** Day or day-range label. */
  day: string;
  /** Hours label, or a closed/holiday label. */
  hours: string;
}

export interface SiteSettingsCopyright {
  /** Fully-formed copyright/legal line (year + org + rights notice). */
  text: string;
}

/**
 * Full shape returned by `GET {publicApiBaseUrl}/site-settings`.
 */
export interface SiteSettings {
  brand: SiteSettingsBrand;
  general: SiteSettingsGeneralInfo;
  contact: SiteSettingsContact;
  socialLinks: readonly SiteSettingsSocialLink[];
  workingHours: readonly SiteSettingsWorkingHoursRow[];
  copyright: SiteSettingsCopyright;
}

/** Public API response types for `GET /public/site-settings`. */
export interface SiteSettingsTranslatable {
  fa: string;
  en?: string;
}

export interface SiteSettingsMedia {
  url: string;
  thumbnailUrl?: string | null;
  cardUrl?: string | null;
  altText: string;
}

export type SiteSettingsSocialPlatform =
  | "instagram"
  | "telegram"
  | "whatsapp"
  | "eitaa"
  | "youtube"
  | "linkedin"
  | "twitter"
  | "facebook";

export interface SiteSettingsSocialLink {
  platform: SiteSettingsSocialPlatform;
  url: string;
}

export interface SiteSettingsSeo {
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImageUrl?: string | null;
  canonicalUrl?: string | null;
  noindex: boolean;
}

/** Mirrors the backend's `PublicSiteSettingsDto`. */
export interface SiteSettings {
  siteName: SiteSettingsTranslatable;
  tagline?: SiteSettingsTranslatable;
  logo: SiteSettingsMedia | null;
  favicon: SiteSettingsMedia | null;
  contactEmail?: string;
  contactPhone?: string;
  address?: SiteSettingsTranslatable;
  mapUrl?: string;
  socialLinks: readonly SiteSettingsSocialLink[];
  defaultSeo: SiteSettingsSeo;
  featureFlags: {
    newsEnabled: boolean;
    galleryEnabled: boolean;
    testimonialsEnabled: boolean;
    faqEnabled: boolean;
    eventsEnabled: boolean;
    ctaEnabled: boolean;
  };
  organizationSchema: Record<string, unknown>;
}

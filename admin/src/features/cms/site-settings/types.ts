/**
 * Types for the CMS Site Settings module, mirroring the backend
 * `SiteSettings` entity and its DTOs
 * (`backend/src/modules/website/content/site-settings/entities/site-settings.entity.ts`,
 * `.../site-settings/dto/*.ts`). Same "mirror, don't import" reasoning
 * as `features/cms/faq/types.ts` / `features/cms/media/types.ts` — the
 * admin frontend and the NestJS backend are separate packages with no
 * shared runtime code path.
 *
 * `siteId` is deliberately not modeled here, same call every other
 * module's types file makes — nothing in this admin frontend acts on
 * it today.
 *
 * General/Contact/Social/Feature-Flags each have a corresponding
 * *update* payload type below. SEO remains out of scope — it's a real
 * section on the entity (so it's modeled on `CmsSiteSettings` for
 * GET-response fidelity) but gated server-side behind
 * `website.seo:manage` (`SiteSettingsController`), which no CMS admin
 * page implements a form for yet.
 *
 * Feature Flags (`UpdateFeatureFlagsPayload`) is gated behind
 * `website.feature_flags:manage`, distinct from
 * `website.content:write` — `AdminPermission` (`types/auth.ts`)
 * already carries this literal (only `WebsiteRole.SUPER_ADMIN` holds
 * it — see backend `ROLE_PERMISSIONS`), same "gate at the exact
 * permission the backend route requires" approach `updateSeo` would
 * use if it existed. Only `ctaEnabled` has a form field
 * (`FeatureFlagsSection` in `SettingsForm.tsx`) — the other flags
 * (`newsEnabled`, etc.) stay admin-managed only through direct
 * database/API access for now; add a control for each here if/when
 * that's actually needed, not speculatively.
 */

import type { CmsEntityMeta, Translatable } from "../types";

/** Mirrors `SocialPlatform` (backend). String union, not a TS `enum` —
 *  same reasoning as `CmsFaqStatus`/`CmsMediaStatus`: no runtime
 *  footprint, just types. */
export type CmsSocialPlatform =
  | "instagram"
  | "telegram"
  | "whatsapp"
  | "eitaa"
  | "youtube"
  | "linkedin"
  | "twitter"
  | "facebook";

/** Mirrors `SocialLink` (backend) — one entry in `socialLinks`. */
export interface CmsSocialLink {
  platform: CmsSocialPlatform;
  url: string;
}

/**
 * Mirrors the shared `SeoMetadata` embeddable (backend). Modeled here
 * only so `CmsSiteSettings` reflects the full `GET /site-settings`
 * response shape — there's no SEO form in this sprint (see file doc).
 */
export interface CmsSeoMetadata {
  metaTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;
  canonicalUrl?: string;
  noindex?: boolean;
}

/**
 * Mirrors `SiteFeatureFlags` (backend). Modeled here only so
 * `CmsSiteSettings` reflects the full `GET /site-settings` response
 * shape — there's no Feature Flags form in this sprint (see file doc).
 */
export interface CmsSiteFeatureFlags {
  newsEnabled: boolean;
  galleryEnabled: boolean;
  testimonialsEnabled: boolean;
  faqEnabled: boolean;
  eventsEnabled: boolean;
  ctaEnabled: boolean;
}

/**
 * The singleton Site Settings row. Extends `CmsEntityMeta` for
 * `id`/`createdAt`/`updatedAt` rather than redeclaring them, per the
 * convention `features/cms/README.md` documents — there is always
 * exactly one of these (`SiteSettingsService` auto-seeds it), never a
 * list.
 */
export interface CmsSiteSettings extends CmsEntityMeta {
  siteName: Translatable<string>;
  tagline?: Translatable<string>;
  logoMediaId?: string;
  faviconMediaId?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: Translatable<string>;
  mapUrl?: string;
  socialLinks: CmsSocialLink[];
  defaultSeo: CmsSeoMetadata;
  featureFlags: CmsSiteFeatureFlags;
}

/**
 * Body for `PATCH /admin/site-settings/general`. Mirrors
 * `UpdateGeneralSettingsDto`. `logoMediaId`/`faviconMediaId`: explicit
 * `null` clears the reference, `undefined` leaves it unchanged — same
 * convention `UpdateGeneralSettingsDto`'s own comment documents.
 */
export interface UpdateGeneralSettingsPayload {
  siteName?: Translatable<string>;
  tagline?: Translatable<string>;
  logoMediaId?: string | null;
  faviconMediaId?: string | null;
}

/** Body for `PATCH /admin/site-settings/contact`. Mirrors `UpdateContactSettingsDto`. */
export interface UpdateContactSettingsPayload {
  contactEmail?: string;
  contactPhone?: string;
  address?: Translatable<string>;
  mapUrl?: string;
}

/**
 * Body for `PATCH /admin/site-settings/social`. Mirrors
 * `UpdateSocialLinksDto` — replaces the whole `socialLinks` array
 * wholesale, not a per-entry add/remove endpoint (see that DTO's own
 * comment for why).
 */
export interface UpdateSocialLinksPayload {
  socialLinks: CmsSocialLink[];
}

/**
 * Body for `PATCH /admin/site-settings/feature-flags`. Mirrors
 * `UpdateFeatureFlagsDto` — every flag optional (PATCH semantics, only
 * flags present in the body are changed). Every flag from
 * `CmsSiteFeatureFlags` is modeled here for DTO fidelity even though
 * `FeatureFlagsSection` (`SettingsForm.tsx`) only sends `ctaEnabled`
 * today — see this file's top comment.
 */
export interface UpdateFeatureFlagsPayload {
  newsEnabled?: boolean;
  galleryEnabled?: boolean;
  testimonialsEnabled?: boolean;
  faqEnabled?: boolean;
  eventsEnabled?: boolean;
  ctaEnabled?: boolean;
}

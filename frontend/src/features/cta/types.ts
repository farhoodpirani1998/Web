/**
 * Public API response types for the backend's **CTA** ("call to
 * action") content module (Website Frontend Architecture §4, §8),
 * consumed by the `cta` feature's data-fetching hook (`./api`,
 * `./useCTA`).
 *
 * Two shapes live here:
 * - `PublicCtaDto`/`PublicMediaRef`/`Translatable` mirror the real
 *   wire response from `GET /public/cta`
 *   (`backend/.../public-api/cta/public-cta.controller.ts`). Notably,
 *   there is no `eyebrow` field on the backend at all — that copy is
 *   `./CTA.tsx`'s own static placeholder, not CMS content — and the
 *   two buttons are flat `primaryButtonLabel`/`primaryButtonUrl` (+
 *   optional secondary) fields, not nested `primaryCta`/`secondaryCta`
 *   objects.
 * - `CTA`/`CTALink` are the shape `./CTA.tsx` already renders
 *   (headline, supporting text, up to two `{ label, href }` CTAs) —
 *   `./api.ts` adapts the flat wire fields into this shape so the
 *   component needs no changes beyond dropping the nonexistent
 *   `eyebrow` read.
 */

/** Local mirror of the backend kernel's `Translatable<T>` — `fa` required, `en` optional. */
export interface Translatable<T = string> {
  fa: T;
  en?: T;
}

/** Local mirror of the public-api layer's `PublicMediaRef` — only the fields the public site needs. */
export interface PublicMediaRef {
  url: string;
  thumbnailUrl?: string;
  cardUrl?: string;
  altText: string;
}

/** Wire shape returned by `GET {publicApiBaseUrl}/cta`. */
export interface PublicCtaDto {
  title: Translatable<string>;
  description?: Translatable<string>;
  primaryButtonLabel: Translatable<string>;
  primaryButtonUrl: string;
  secondaryButtonLabel?: Translatable<string>;
  secondaryButtonUrl?: string;
  backgroundImage: PublicMediaRef | null;
}

export interface CTALink {
  label: string;
  /** In-app path or absolute URL. */
  href: string;
}

/**
 * Shape `useCTA()` resolves to, after `./api.ts` adapts `PublicCtaDto`'s
 * flat button fields into this form.
 */
export interface CTA {
  title: string;
  description?: string;
  primaryCta: CTALink;
  secondaryCta?: CTALink;
}

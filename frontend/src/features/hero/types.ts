/**
 * Public API response types for the backend's **Hero** content module
 * (Website Frontend Architecture §4, §8), consumed by the `hero`
 * feature's data-fetching hook (`./api`, `./useHero`).
 *
 * Two shapes live here:
 * - `PublicHeroSlideDto`/`PublicMediaRef`/`Translatable` mirror the
 *   real wire response from `GET /public/hero`
 *   (`backend/.../public-api/hero/public-hero.controller.ts`) — a
 *   *list* of published slides, ordered by `position`. Same "mirror,
 *   don't import" reasoning as the `statistics` feature's `types.ts`.
 * - `Hero`/`HeroImage`/`HeroCta` are the single-slide shape
 *   `./Hero.tsx` already renders (eyebrow label, headline, supporting
 *   text, background image, up to two CTAs) — `./api.ts` adapts the
 *   first published slide into this shape so the component needs no
 *   changes.
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

/** Wire shape of one entry in the array returned by `GET {publicApiBaseUrl}/hero`. */
export interface PublicHeroSlideDto {
  id: string;
  heading: Translatable<string>;
  subheading?: Translatable<string>;
  ctaLabel?: Translatable<string>;
  ctaUrl?: string;
  backgroundImage: PublicMediaRef | null;
  position: number;
}

export interface HeroImage {
  /** Background photo asset URL. */
  src: string;
  /** Required alt text (§26 accessibility). */
  alt: string;
}

export interface HeroCta {
  label: string;
  /** In-app path or absolute URL. */
  href: string;
}

/**
 * Shape `useHero()` resolves to, after `./api.ts` adapts the first
 * published slide out of `GET {publicApiBaseUrl}/hero`'s array
 * response into this single-slide form.
 */
export interface Hero {
  /** Small kicker/eyebrow label shown above the headline. */
  eyebrow?: string;
  title: string;
  description: string;
  image: HeroImage;
  primaryCta?: HeroCta;
  secondaryCta?: HeroCta;
}

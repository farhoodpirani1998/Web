/**
 * Public API response types for the backend's **Hero** content module
 * (Website Frontend Architecture §4, §8), consumed by the `hero`
 * feature's data-fetching hook (`./api`, `./useHero`).
 *
 * Shaped to match what `./Hero.tsx` currently renders as placeholder
 * copy (eyebrow label, headline, supporting text, background image,
 * up to two CTAs) so wiring the component to real data later is a
 * matter of swapping its data source, not its markup.
 */

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
 * Full shape returned by `GET {publicApiBaseUrl}/hero`.
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

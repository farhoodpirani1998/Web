/**
 * Public API response types for the backend's **CTA** ("call to
 * action") content module (Website Frontend Architecture §4, §8),
 * consumed by the `cta` feature's data-fetching hook (`./api`,
 * `./useCTA`).
 *
 * Shaped to match what `./CTA.tsx` currently renders as placeholder
 * copy (eyebrow label, headline, supporting text, up to two CTAs) so
 * wiring the component to real data later is a matter of swapping its
 * data source, not its markup.
 */

export interface CTALink {
  label: string;
  /** In-app path or absolute URL. */
  href: string;
}

/**
 * Full shape returned by `GET {publicApiBaseUrl}/cta`.
 */
export interface CTA {
  /** Small kicker/eyebrow label shown above the headline. */
  eyebrow?: string;
  title: string;
  description: string;
  primaryCta?: CTALink;
  secondaryCta?: CTALink;
}

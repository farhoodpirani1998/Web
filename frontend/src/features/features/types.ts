/**
 * Public API response types for the backend's **Features** ("Why
 * Choose Us") content module (Website Frontend Architecture §4, §8),
 * consumed by the `features` feature's data-fetching hook (`./api`,
 * `./useFeatures`).
 *
 * Shaped to match what `./Features.tsx` currently renders as
 * placeholder copy (eyebrow badge, heading, intro text, and a grid of
 * icon + title + description items) so wiring the component to real
 * data later is a matter of swapping its data source, not its markup.
 */

export interface FeatureItem {
  /** Stable identifier, e.g. "smart-classrooms". */
  id: string;
  /**
   * `lucide-react` icon name (e.g. "Monitor", "FlaskConical") as
   * returned by the CMS. The component maps this to the actual icon
   * component, falling back to a default icon for unknown names.
   */
  icon: string;
  title: string;
  description: string;
}

/**
 * Full shape returned by `GET {publicApiBaseUrl}/features`.
 */
export interface Features {
  /** Small kicker/eyebrow label shown above the heading. */
  eyebrow?: string;
  heading: string;
  /** Supporting/lead paragraph under the heading. */
  description: string;
  items: readonly FeatureItem[];
}

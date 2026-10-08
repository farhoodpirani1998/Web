/**
 * Public API response types for the backend's **Features** ("Why
 * Choose Us") content module (Website Frontend Architecture §4, §8),
 * consumed by the `features` feature's data-fetching hook (`./api`,
 * `./useFeatures`).
 *
 * The real endpoint (`GET /public/features`,
 * `backend/.../public-api/features/public-features.controller.ts`)
 * returns a flat *list* of cards (`id`, translatable `title`/
 * `description`, optional `icon`, `position`) — there is no
 * section-level eyebrow/heading/intro field on the backend; that copy
 * is `./Features.tsx`'s own static placeholder, not CMS content. This
 * mirrors the real wire shape directly (same "mirror, don't import"
 * reasoning as the `statistics` feature's `types.ts`) rather than the
 * previous `{ eyebrow, heading, description, items }` wrapper, which
 * assumed fields the backend never sends.
 */

/** Local mirror of the backend kernel's `Translatable<T>` — `fa` required, `en` optional. */
export interface Translatable<T = string> {
  fa: T;
  en?: T;
}

export interface FeatureItem {
  /** Stable identifier. */
  id: string;
  title: Translatable<string>;
  description: Translatable<string>;
  /**
   * Icon-library key as stored by the CMS (an editor-supplied design
   * token, e.g. "graduation-cap" — see the backend `Feature` entity's
   * doc comment). The component maps this to an actual icon
   * component, falling back to a default icon for unknown/missing
   * names.
   */
  icon?: string;
  position: number;
}

/** Full shape returned by `GET {publicApiBaseUrl}/features`. */
export type Features = readonly FeatureItem[];

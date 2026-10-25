/**
 * Public API types for the backend's **Testimonials** content module
 * (Website Frontend Architecture §4, §8), consumed by the
 * `testimonials` feature's data-fetching hook (`./api`,
 * `./useTestimonials`).
 *
 * The real endpoint (`GET /public/testimonials`) returns a flat,
 * position-ordered list — "mirror, don't import", same as the
 * `features`/`achievements` features' `types.ts`.
 */

/** Local mirror of the backend kernel's `Translatable<T>` — `fa` required, `en` optional. */
export interface Translatable<T = string> {
  fa: T;
  en?: T;
}

/** Local mirror of the public-api layer's `PublicMediaRef`. */
export interface PublicMediaRef {
  url: string;
  thumbnailUrl?: string;
  cardUrl?: string;
  altText: string;
}

export interface TestimonialItem {
  id: string;
  /** Person's name — a proper noun, not translatable (same as Teacher.fullName). */
  authorName: string;
  authorRole?: Translatable<string>;
  content: Translatable<string>;
  /** 1–5 stars; omitted when the reviewer left no rating. */
  rating?: number;
  avatar: PublicMediaRef | null;
  position: number;
}

/** Full shape returned by `GET {publicApiBaseUrl}/testimonials`. */
export type Testimonials = readonly TestimonialItem[];

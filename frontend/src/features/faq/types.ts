/**
 * Public API response types for the backend's **FAQ** content module
 * (Website Frontend Architecture §4, §8), consumed by the `faq`
 * feature's data-fetching hook (`./api`, `./useFaq`).
 *
 * Mirrors the same question/answer shape already rendered as local
 * placeholder copy by `@/features/news`'s `FAQ.tsx` (and the sibling
 * `campuses`/`pre-registration`/`gallery` FAQ sections), so wiring any
 * of those components to real data later is a matter of swapping
 * their data source, not their markup.
 */

export interface FaqItem {
  /** Stable identifier, also usable as the React list key and the
   *  `<details>` disclosure's anchor id. */
  id: string;
  question: string;
  answer: string;
}

/**
 * Full shape returned by `GET {publicApiBaseUrl}/faq`.
 */
export type Faq = readonly FaqItem[];

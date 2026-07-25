/**
 * Public surface of the shared SEO layer (§21).
 *
 * Feature pages that render a public-api response carrying `seo`/
 * `structuredData` fields (About, News, Events, Campuses, Teachers,
 * Static Pages, ...) should use `Seo`/`useSeo` from here rather than
 * writing to `document.head` themselves.
 */
export { Seo } from "./Seo";
export type { SeoProps } from "./Seo";
export { useSeo } from "./useSeo";
export type { PublicSeoDto, StructuredDataItem } from "./types";

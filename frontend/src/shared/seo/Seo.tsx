import { useSeo } from "./useSeo";
import type { PublicSeoDto, StructuredDataItem } from "./types";

export interface SeoProps {
  /** A public-api response's `seo` field, e.g. `PublicAboutDto.seo`. Renders nothing while absent (e.g. during loading). */
  seo: PublicSeoDto | undefined;
  /** That same response's `structuredData` field, if it has one. */
  structuredData?: readonly StructuredDataItem[];
}

/**
 * Declarative wrapper around `useSeo` (§21) for page components that
 * prefer a JSX element over calling a hook directly — e.g.
 * `<Seo seo={data.seo} structuredData={data.structuredData} />`
 * alongside a page's other rendered content. Renders nothing itself;
 * all of its work happens as a side effect against `document.head`.
 */
export function Seo({ seo, structuredData }: SeoProps): null {
  useSeo(seo, structuredData);
  return null;
}

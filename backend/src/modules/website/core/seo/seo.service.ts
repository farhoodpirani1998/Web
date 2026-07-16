import { Injectable } from '@nestjs/common';
import { SeoMetadata } from './seo-metadata.embeddable';

@Injectable()
export class SeoService {
  /** Falls back sensibly when an editor hasn't filled in SEO fields. */
  resolveMetaTitle(seo: SeoMetadata | undefined, fallback: string): string {
    return seo?.metaTitle?.trim() || fallback;
  }

  toJsonLd(type: string, fields: Record<string, unknown>) {
    return { '@context': 'https://schema.org', '@type': type, ...fields };
  }

  /**
   * Whether an entity's SeoMetadata permits it to be listed for search
   * engines. Static (no DI needed) so every sitemap provider — which
   * already builds its entry list inline in a callback registered with
   * SitemapService — can call it as a plain filter predicate without
   * threading SeoService through its constructor.
   */
  static isIndexable(seo: SeoMetadata | undefined): boolean {
    return !seo?.noindex;
  }
}


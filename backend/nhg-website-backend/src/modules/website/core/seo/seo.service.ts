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
}

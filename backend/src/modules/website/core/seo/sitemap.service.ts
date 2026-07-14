import { Injectable } from '@nestjs/common';

export interface SitemapEntry {
  loc: string;
  lastmod?: Date;
}

type SitemapProvider = () => Promise<SitemapEntry[]>;

/**
 * Content modules register a provider function at startup; /sitemap.xml
 * is generated dynamically from whatever providers are registered.
 * Disabled sections (feature-flagged off) are expected to return an
 * empty array from their own provider rather than being filtered here.
 */
@Injectable()
export class SitemapService {
  private providers: SitemapProvider[] = [];

  register(provider: SitemapProvider) {
    this.providers.push(provider);
  }

  async generate(): Promise<SitemapEntry[]> {
    const results = await Promise.all(this.providers.map((p) => p()));
    return results.flat();
  }
}

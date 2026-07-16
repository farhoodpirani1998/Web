import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SeoMetadata } from './seo-metadata.embeddable';

/**
 * Resolved SEO data for a single public page — what
 * PublicVisibilityService/PublicMediaService are for their own
 * concerns, but for SEO. Every public-api detail controller builds one
 * of these via SeoService.resolvePublicSeo() and exposes it as its
 * response's `seo` field, replacing the raw SeoMetadata embeddable
 * (metaTitle/metaDescription/etc — still an editor-facing shape, not a
 * render-ready one: no fallback title, no absolute canonical URL, no
 * robots directive).
 */
export interface PublicSeoDto {
  title: string;
  description?: string;
  canonicalUrl: string;
  ogImageUrl?: string;
  robots: string;
}

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

  /**
   * Same PUBLIC_SITE_URL/PORT fallback PublicSitemapController already
   * used for absolute sitemap URLs — centralized here so every public
   * detail controller building a canonical URL follows the same rule
   * instead of re-deriving it.
   */
  resolveBaseUrl(config: ConfigService): string {
    const port = config.get<number>('PORT', 3100);
    return config.get<string>('PUBLIC_SITE_URL', `http://localhost:${port}`);
  }

  /**
   * Assembles the render-ready SEO data for one public page: resolved
   * title (falls back to the entity's own title), description (no
   * fallback — an empty meta description is preferable to a wrong one
   * built from body content), an absolute canonical URL (the editor's
   * explicit override if set, otherwise this page's own canonical
   * path), and a robots directive matching this same noindex flag
   * sitemap generation already honors (see isIndexable).
   */
  resolvePublicSeo(
    seo: SeoMetadata | undefined,
    fallbackTitle: string,
    canonicalPath: string,
    baseUrl: string,
  ): PublicSeoDto {
    return {
      title: this.resolveMetaTitle(seo, fallbackTitle),
      description: seo?.metaDescription?.trim() || undefined,
      canonicalUrl: seo?.canonicalUrl?.trim() || `${baseUrl}${canonicalPath}`,
      ogImageUrl: seo?.ogImageUrl,
      robots: SeoService.isIndexable(seo) ? 'index, follow' : 'noindex, nofollow',
    };
  }
}

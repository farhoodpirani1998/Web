/**
 * Shared types for the `seo` layer (Website Frontend Architecture §21).
 *
 * `PublicSeoDto` mirrors the backend's render-ready SEO shape
 * (`backend/src/modules/website/core/seo/seo.service.ts`'s
 * `PublicSeoDto`) that every public-api detail controller assembles
 * via `SeoService.resolvePublicSeo()` and exposes as its response's
 * `seo` field — e.g. `PublicAboutDto.seo`
 * (`backend/src/modules/website/public-api/about/public-about.controller.ts`).
 * "Mirror, don't import" — same convention `@/features/about`,
 * `@/features/campuses`, and `@/features/teachers` already follow for
 * their own DTOs, this file never imports backend code.
 *
 * `StructuredDataItem` mirrors one entry of those same responses'
 * `structuredData` field — a single JSON-LD object (e.g. from
 * `SeoService.buildBreadcrumbSchema`/`buildArticleSchema`/etc). The
 * `@type`/`@context` keys are schema.org's, not ours, hence the loose
 * `Record<string, unknown>` shape rather than a modeled union.
 */

/** Wire shape of a public-api response's `seo` field. */
export interface PublicSeoDto {
  title: string;
  description?: string;
  canonicalUrl: string;
  ogImageUrl?: string;
  robots: string;
}

/** One JSON-LD object from a public-api response's `structuredData` array. */
export type StructuredDataItem = Record<string, unknown>;

import { apiClient } from "@/shared/api";

import type { PublicStaticPageDto } from "./types";

/**
 * Request functions for the `static-pages` feature's Public API
 * endpoints.
 *
 * Per §14/§30, this is the only file in the `static-pages` feature
 * aware of the endpoints' URLs.
 *
 * Both `GET /public/pages/homepage` and `GET /public/pages/:slug`
 * return the same singleton `PublicPageDto` shape (see the
 * controller's doc comment: `homepage` is registered before `:slug`
 * so it's never shadowed by the dynamic route), so both functions
 * here return the raw `PublicStaticPageDto` unchanged — no adapted
 * shape to map into yet, since no page/component consumes this
 * feature (this sprint only adds the fetch layer). `seo`/
 * `structuredData` are preserved exactly as the backend returns them,
 * same convention as `@/features/about`'s `fetchAboutPage` and
 * `@/features/news`'s `fetchNewsBySlug`.
 */
export async function fetchStaticPageBySlug(slug: string): Promise<PublicStaticPageDto> {
  const response = await apiClient.get<PublicStaticPageDto>(`/pages/${slug}`);
  return response.data;
}

export async function fetchHomepage(): Promise<PublicStaticPageDto> {
  const response = await apiClient.get<PublicStaticPageDto>("/pages/homepage");
  return response.data;
}

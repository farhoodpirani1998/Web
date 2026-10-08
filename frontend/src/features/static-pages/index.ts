/**
 * Public surface of the `static-pages` feature.
 *
 * Per §30/§32 ("features never reach into another feature's
 * internals"), other layers should import these only from here —
 * never from `./api`/`./types`/`./useStaticPageBySlug` directly.
 *
 * `useStaticPageBySlug`/`staticPageDetailQueryKey` back
 * `@/pages/StaticPageDetailPage` (route `/pages/:slug`) — the first
 * consumer of this feature. `useHomepage`/`homepageQueryKey` back
 * `HomePage`'s `<Seo />` rendering.
 */
export type { PageTemplate, PublicStaticPageDto } from "./types";
export { fetchHomepage, fetchStaticPageBySlug } from "./api";
export { useStaticPageBySlug, staticPageDetailQueryKey } from "./useStaticPageBySlug";
export { useHomepage, homepageQueryKey } from "./useHomepage";

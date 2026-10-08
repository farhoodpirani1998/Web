/**
 * Portal Links page — route glue only.
 *
 * The real Portal Links UI lives in
 * `features/cms/portal-links/PortalLinksPage.tsx` — feature-owned UI
 * belongs in the feature folder, same convention `pages/MediaPage.tsx`
 * / `pages/FaqPage.tsx` follow. This file just re-exports it so
 * `routes/index.tsx` can import a stable `@/pages/PortalLinksPage`
 * regardless of how the feature folder evolves.
 */
export { PortalLinksPage } from "@/features/cms/portal-links";

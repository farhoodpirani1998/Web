/**
 * News page — route glue only.
 *
 * The real News module UI lives in `features/cms/news/NewsPage.tsx` —
 * feature-owned UI belongs in the feature folder, same convention
 * `pages/FaqPage.tsx`/`pages/HeroSlidesPage.tsx` follow. This file just
 * re-exports it so `routes/index.tsx` can import a stable
 * `@/pages/NewsPage` regardless of how the feature folder evolves.
 */
export { NewsPage } from "@/features/cms/news";

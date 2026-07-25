/**
 * Pages page — route glue only.
 *
 * The real Pages module UI lives in `features/cms/pages/PagesPage.tsx`
 * — feature-owned UI belongs in the feature folder, same convention
 * `pages/NewsPage.tsx` follows. This file just re-exports it so
 * `routes/index.tsx` can import a stable `@/pages/PagesPage` regardless
 * of how the feature folder evolves.
 */
export { PagesPage } from "@/features/cms/pages";

/**
 * Teachers page — route glue only.
 *
 * The real Teachers module UI lives in
 * `features/cms/teachers/TeachersPage.tsx` — feature-owned UI belongs
 * in the feature folder, same convention `pages/EventsPage.tsx`/
 * `pages/NewsPage.tsx`/`pages/PagesPage.tsx` follow. This file just
 * re-exports it so `routes/index.tsx` can import a stable
 * `@/pages/TeachersPage` regardless of how the feature folder evolves.
 */
export { TeachersPage } from "@/features/cms/teachers";

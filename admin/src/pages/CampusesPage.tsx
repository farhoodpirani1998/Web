/**
 * Campuses page — route glue only.
 *
 * The real Campuses module UI lives in
 * `features/cms/campuses/CampusesPage.tsx` — feature-owned UI belongs
 * in the feature folder, same convention `pages/EventsPage.tsx`/
 * `pages/TeachersPage.tsx`/`pages/NewsPage.tsx` follow. This file just
 * re-exports it so `routes/index.tsx` can import a stable
 * `@/pages/CampusesPage` regardless of how the feature folder evolves.
 */
export { CampusesPage } from "@/features/cms/campuses";

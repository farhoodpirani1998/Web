/**
 * Events page — route glue only.
 *
 * The real Events module UI lives in `features/cms/events/EventsPage.tsx`
 * — feature-owned UI belongs in the feature folder, same convention
 * `pages/NewsPage.tsx`/`pages/PagesPage.tsx` follow. This file just
 * re-exports it so `routes/index.tsx` can import a stable
 * `@/pages/EventsPage` regardless of how the feature folder evolves.
 */
export { EventsPage } from "@/features/cms/events";

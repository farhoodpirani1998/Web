/**
 * Dashboard page — route glue only.
 *
 * The real Dashboard module UI lives in
 * `features/cms/dashboard/DashboardPage.tsx` — feature-owned UI
 * belongs in the feature folder, same convention every other CMS
 * module follows (see `pages/FaqPage.tsx`). This file just re-exports
 * it so `routes/index.tsx` can import a stable `@/pages/DashboardPage`
 * regardless of how the feature folder evolves.
 */
export { DashboardPage } from "@/features/cms/dashboard";

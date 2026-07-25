/**
 * Statistics page — route glue only.
 *
 * The real Statistics module UI lives in
 * `features/cms/statistics/StatisticsPage.tsx` — feature-owned UI
 * belongs in the feature folder, same convention `pages/FeaturesPage.tsx`
 * follows for Features (see that file's comment). This file just
 * re-exports it so `routes/index.tsx` can import a stable
 * `@/pages/StatisticsPage` regardless of how the feature folder
 * evolves.
 */
export { StatisticsPage } from "@/features/cms/statistics";

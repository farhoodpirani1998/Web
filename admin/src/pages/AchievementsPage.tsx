/**
 * Achievements page — route glue only.
 *
 * The real UI lives in `features/cms/achievements/AchievementsPage.tsx` —
 * feature-owned UI belongs in the feature folder, same convention
 * `pages/FaqPage.tsx` follows. This file re-exports it so
 * `routes/index.tsx` can import a stable `@/pages/AchievementsPage`.
 */
export { AchievementsPage } from "@/features/cms/achievements";

/**
 * Public surface of the `cms/achievements` feature.
 *
 * Other layers (pages) should import from here rather than reaching into
 * `./api`, `./hooks/useAchievements`, etc. directly — same convention as
 * `features/cms/faq/index.ts`.
 */
export type {
  CmsAchievement,
  CmsAchievementStatus,
  CreateAchievementPayload,
  UpdateAchievementPayload,
} from "./types";
export {
  fetchAchievementList,
  fetchAchievementById,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  updateAchievementStatus,
  reorderAchievements,
} from "./api";
export { useAchievements, type UseAchievementsResult } from "./hooks/useAchievements";

export { AchievementsPage } from "./AchievementsPage";

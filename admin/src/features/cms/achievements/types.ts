/**
 * Types for the CMS Achievements module, mirroring the backend
 * `Achievement` entity and its DTOs
 * (`backend/src/modules/website/content/achievements/entities/achievement.entity.ts`,
 * `.../achievements/dto/*.ts`). Same "mirror, don't import" reasoning as
 * `features/cms/faq/types.ts`.
 */

import type { CmsEntityMeta, CmsPublishStatus, Translatable } from "../types";

/** Mirrors `PublishStatus` (backend) as used on the `Achievement` entity. */
export type CmsAchievementStatus = CmsPublishStatus;

/** A single figure in the homepage Achievements band. */
export interface CmsAchievement extends CmsEntityMeta {
  /** Already-formatted display value, e.g. "۱۵+" or "۹۵٪". */
  value: string;
  label: Translatable<string>;
  icon?: string;
  position: number;
  status: CmsAchievementStatus;
}

/** Body for `POST /admin/achievements`. Mirrors `CreateAchievementDto`. */
export interface CreateAchievementPayload {
  value: string;
  label: Translatable<string>;
  icon?: string;
}

/** Body for `PATCH /admin/achievements/:id`. Mirrors `UpdateAchievementDto`. */
export interface UpdateAchievementPayload {
  value?: string;
  label?: Translatable<string>;
  icon?: string | null;
}

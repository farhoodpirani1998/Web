/**
 * Types for the CMS Statistics module, mirroring the backend `Statistic`
 * entity and its DTOs
 * (`backend/src/modules/website/content/statistics/entities/statistic.entity.ts`,
 * `.../statistics/dto/*.ts`). Same "mirror, don't import" reasoning as
 * `features/cms/features/types.ts` and `features/cms/faq/types.ts` —
 * the admin frontend and the NestJS backend are separate packages with
 * no shared runtime code path.
 *
 * `siteId` (present on the entity via `BaseSiteScopedEntity`) is
 * deliberately not modeled here, same call `features/cms/features/types.ts`
 * makes — nothing in this admin frontend acts on it today (exactly one
 * site exists, resolved server-side).
 */

import type { CmsEntityMeta, CmsPublishStatus, Translatable } from "../types";

/** Mirrors `PublishStatus` (backend) as used on the `Statistic` entity. */
export type CmsStatisticStatus = CmsPublishStatus;

/**
 * A single "by the numbers" stat counter (e.g. "500+ Graduates") for
 * the public statistics/counters section. Extends `CmsEntityMeta` for
 * `id`/`createdAt`/`updatedAt` rather than redeclaring them, per the
 * convention `features/cms/README.md` documents.
 */
export interface CmsStatistic extends CmsEntityMeta {
  label: Translatable<string>;
  value: number;
  suffix?: string;
  icon?: string;
  position: number;
  status: CmsStatisticStatus;
}

/** Body for `POST /admin/statistics`. Mirrors `CreateStatisticDto`. */
export interface CreateStatisticPayload {
  label: Translatable<string>;
  value: number;
  suffix?: string;
  icon?: string;
}

/** Body for `PATCH /admin/statistics/:id`. Mirrors `UpdateStatisticDto`. */
export interface UpdateStatisticPayload {
  label?: Translatable<string>;
  value?: number;
  suffix?: string | null;
  icon?: string | null;
}

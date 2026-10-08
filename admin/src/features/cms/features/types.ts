/**
 * Types for the CMS Features module, mirroring the backend `Feature`
 * entity and its DTOs
 * (`backend/src/modules/website/content/features/entities/feature.entity.ts`,
 * `.../features/dto/*.ts`). Same "mirror, don't import" reasoning as
 * `types/auth.ts` and `features/cms/faq/types.ts` — the admin frontend
 * and the NestJS backend are separate packages with no shared runtime
 * code path.
 *
 * `siteId` (present on the entity via `BaseSiteScopedEntity`) is
 * deliberately not modeled here, same call `features/cms/faq/types.ts`
 * makes — nothing in this admin frontend acts on it today (exactly one
 * site exists, resolved server-side).
 */

import type { CmsEntityMeta, CmsPublishStatus, Translatable } from "../types";

/** Mirrors `PublishStatus` (backend) as used on the `Feature` entity. */
export type CmsFeatureStatus = CmsPublishStatus;

/**
 * A single "why choose us" style card (e.g. "Bilingual curriculum") for
 * the public features/highlights section. Extends `CmsEntityMeta` for
 * `id`/`createdAt`/`updatedAt` rather than redeclaring them, per the
 * convention `features/cms/README.md` documents.
 */
export interface CmsFeature extends CmsEntityMeta {
  title: Translatable<string>;
  description: Translatable<string>;
  icon?: string;
  position: number;
  status: CmsFeatureStatus;
}

/** Body for `POST /admin/features`. Mirrors `CreateFeatureDto`. */
export interface CreateFeaturePayload {
  title: Translatable<string>;
  description: Translatable<string>;
  icon?: string;
}

/** Body for `PATCH /admin/features/:id`. Mirrors `UpdateFeatureDto`. */
export interface UpdateFeaturePayload {
  title?: Translatable<string>;
  description?: Translatable<string>;
  icon?: string;
}

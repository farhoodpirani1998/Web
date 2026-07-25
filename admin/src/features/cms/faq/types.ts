/**
 * Types for the CMS FAQ module, mirroring the backend `Faq` entity and
 * its DTOs (`backend/src/modules/website/content/faq/entities/faq.entity.ts`,
 * `.../faq/dto/*.ts`). Same "mirror, don't import" reasoning as
 * `types/auth.ts` and `features/cms/media/types.ts` — the admin
 * frontend and the NestJS backend are separate packages with no shared
 * runtime code path.
 *
 * `siteId` (present on the entity via `BaseSiteScopedEntity`) is
 * deliberately not modeled here, same call `features/cms/media/types.ts`
 * makes for `CmsMedia`/`Media` — nothing in this admin frontend acts on
 * it today (exactly one site exists, resolved server-side).
 */

import type { CmsEntityMeta, CmsPublishStatus, Translatable } from "../types";

/** Mirrors `PublishStatus` (backend) as used on the `Faq` entity. */
export type CmsFaqStatus = CmsPublishStatus;

/**
 * A single FAQ question/answer pair. Extends `CmsEntityMeta` for
 * `id`/`createdAt`/`updatedAt` rather than redeclaring them, per the
 * convention `features/cms/README.md` documents.
 */
export interface CmsFaq extends CmsEntityMeta {
  question: Translatable<string>;
  answer: Translatable<string>;
  category?: string;
  position: number;
  status: CmsFaqStatus;
}

/** Body for `POST /admin/faqs`. Mirrors `CreateFaqDto`. */
export interface CreateFaqPayload {
  question: Translatable<string>;
  answer: Translatable<string>;
  category?: string;
}

/** Body for `PATCH /admin/faqs/:id`. Mirrors `UpdateFaqDto`. */
export interface UpdateFaqPayload {
  question?: Translatable<string>;
  answer?: Translatable<string>;
  category?: string;
}

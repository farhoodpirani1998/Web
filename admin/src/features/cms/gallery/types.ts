/**
 * Types for the CMS Gallery module, mirroring the backend `GalleryItem`
 * entity and its DTOs
 * (`backend/src/modules/website/content/gallery/entities/gallery-item.entity.ts`,
 * `.../gallery/dto/*.ts`). Same "mirror, don't import" reasoning as
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

/** Mirrors `PublishStatus` (backend) as used on the `GalleryItem` entity. */
export type CmsGalleryStatus = CmsPublishStatus;

/**
 * A single photo in the public gallery. Extends `CmsEntityMeta` for
 * `id`/`createdAt`/`updatedAt` rather than redeclaring them, per the
 * convention `features/cms/README.md` documents.
 *
 * `imageMediaId` is a reference only (per the Media convention) — the
 * resolved `CmsMedia` row is fetched separately via
 * `media/useMediaById`, never embedded here.
 */
export interface CmsGalleryItem extends CmsEntityMeta {
  imageMediaId: string;
  caption?: Translatable<string>;
  category?: string;
  position: number;
  status: CmsGalleryStatus;
}

/** Body for `POST /admin/gallery`. Mirrors `CreateGalleryItemDto`. */
export interface CreateGalleryItemPayload {
  imageMediaId: string;
  caption?: Translatable<string>;
  category?: string;
}

/**
 * Body for `PATCH /admin/gallery/:id`. Mirrors `UpdateGalleryItemDto` —
 * `imageMediaId` is optional here (swapping the photo is supported) but,
 * per that DTO's own comment, is never nullable: there is no way to
 * clear it via this endpoint, only replace it. Delete the item instead.
 */
export interface UpdateGalleryItemPayload {
  imageMediaId?: string;
  caption?: Translatable<string>;
  category?: string;
}

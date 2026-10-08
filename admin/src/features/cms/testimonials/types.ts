/**
 * Types for the CMS Testimonials module, mirroring the backend
 * `Testimonial` entity and its DTOs
 * (`backend/src/modules/website/content/testimonials/entities/testimonial.entity.ts`,
 * `.../testimonials/dto/*.ts`). Same "mirror, don't import" reasoning
 * as `types/auth.ts` and `features/cms/faq/types.ts` — the admin
 * frontend and the NestJS backend are separate packages with no shared
 * runtime code path.
 *
 * `siteId` (present on the entity via `BaseSiteScopedEntity`) is
 * deliberately not modeled here, same call every other module's
 * `types.ts` makes — nothing in this admin frontend acts on it today
 * (exactly one site exists, resolved server-side).
 *
 * No seo, no revisions, no schedule — matching `TestimonialsModule`'s
 * own doc comment ("same reasoning as FaqModule"). Testimonials has a
 * `position` field and a `/reorder` endpoint, same idiom as FAQ/
 * Teachers — `TestimonialList`/`TestimonialRow` render drag handles/
 * move buttons the way `FaqList`/`FaqRow` do.
 *
 * `authorName` mirrors the entity: a proper noun, deliberately typed
 * as a plain `string`, NOT `Translatable<string>` — same reasoning as
 * `Teacher.fullName` (see the entity's own doc comment). `authorRole`
 * and `content` are prose, so both are `Translatable<string>` —
 * `authorRole` optional (a plain quote with no attribution role is
 * valid), `content` required.
 *
 * `avatarMediaId` is a plain optional uuid reference into core/media,
 * tracked via MediaUsage — never an embedded copy, same convention as
 * `Teacher.avatarMediaId`.
 */

import type { CmsEntityMeta, CmsPublishStatus, Translatable } from "../types";

/** Mirrors `PublishStatus` (backend) as used on the `Testimonial` entity. */
export type CmsTestimonialStatus = CmsPublishStatus;

/**
 * A single testimonial quote. Extends `CmsEntityMeta` for
 * `id`/`createdAt`/`updatedAt` rather than redeclaring them, per the
 * convention `features/cms/README.md` documents.
 */
export interface CmsTestimonial extends CmsEntityMeta {
  /** Proper noun — plain string, not translatable. See this file's top comment. */
  authorName: string;
  authorRole?: Translatable<string>;
  content: Translatable<string>;
  /** 1-5, optional — not every testimonial carries a star rating. */
  rating?: number;
  /** Reference into core/media, tracked via MediaUsage — never an embedded copy. */
  avatarMediaId?: string;
  /** Manual admin ordering — primary sort key for both admin and public listings. */
  position: number;
  status: CmsTestimonialStatus;
}

/** Body for `POST /admin/testimonials`. Mirrors `CreateTestimonialDto`. `position` is not settable — a new testimonial is appended to the end of the current order server-side. */
export interface CreateTestimonialPayload {
  authorName: string;
  authorRole?: Translatable<string>;
  content: Translatable<string>;
  rating?: number;
  avatarMediaId?: string;
}

/**
 * Body for `PATCH /admin/testimonials/:id`. Mirrors
 * `UpdateTestimonialDto` — `avatarMediaId` accepts an explicit `null`
 * to clear the value (that DTO's own comment: "Explicit null clears
 * the avatar; undefined leaves it unchanged"), same clearable
 * convention as Teachers' `avatarMediaId`. `position` is not editable
 * through this endpoint — see `ReorderTestimonialsDto`/
 * `reorderTestimonials` below.
 */
export interface UpdateTestimonialPayload {
  authorName?: string;
  authorRole?: Translatable<string>;
  content?: Translatable<string>;
  rating?: number;
  avatarMediaId?: string | null;
}

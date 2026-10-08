/**
 * Types for the CMS Hero Slides module, mirroring the backend
 * `HeroSlide` entity and its DTOs
 * (`backend/src/modules/website/content/hero/entities/hero-slide.entity.ts`,
 * `.../hero/dto/*.ts`). Same "mirror, don't import" reasoning as
 * `types/auth.ts` and `features/cms/gallery/types.ts` — the admin
 * frontend and the NestJS backend are separate packages with no shared
 * runtime code path.
 *
 * `siteId` (present on the entity via `BaseSiteScopedEntity`) is
 * deliberately not modeled here, same call every other module's
 * `types.ts` makes — nothing in this admin frontend acts on it today
 * (exactly one site exists, resolved server-side).
 *
 * Hero is one of the backend's revision-enabled types (`HeroController`
 * exposes `GET /:id/revisions` and a restore route, gated behind
 * `website.revisions:view`/`website.revisions:restore`) — see
 * `CmsHeroSlideRevision` below for the shape returned by that endpoint,
 * same "mirror `ContentRevision`" convention `features/cms/campuses/types.ts`
 * and `features/cms/news/types.ts` use.
 */

import type { CmsEntityMeta, CmsPublishStatus, Translatable } from "../types";

/** Mirrors `PublishStatus` (backend) as used on the `HeroSlide` entity. */
export type CmsHeroSlideStatus = CmsPublishStatus;

/**
 * A single slide in the homepage hero carousel. Extends `CmsEntityMeta`
 * for `id`/`createdAt`/`updatedAt` rather than redeclaring them, per
 * the convention `features/cms/README.md` documents.
 */
export interface CmsHeroSlide extends CmsEntityMeta {
  heading: Translatable<string>;
  subheading?: Translatable<string>;
  ctaLabel?: Translatable<string>;
  ctaUrl?: string;
  backgroundMediaId?: string;
  position: number;
  status: CmsHeroSlideStatus;
}

/** Body for `POST /admin/hero-slides`. Mirrors `CreateHeroSlideDto`. */
export interface CreateHeroSlidePayload {
  heading: Translatable<string>;
  subheading?: Translatable<string>;
  ctaLabel?: Translatable<string>;
  ctaUrl?: string;
  backgroundMediaId?: string;
}

/**
 * Body for `PATCH /admin/hero-slides/:id`. Mirrors `UpdateHeroSlideDto`
 * — unlike Gallery's `imageMediaId`, `backgroundMediaId` here accepts
 * an explicit `null` to clear the reference (`UpdateHeroSlideDto`'s own
 * comment: "Explicit null clears the background image; undefined
 * leaves it as-is"), same clearable-media convention as Site Settings'
 * `logoMediaId`/`faviconMediaId`.
 */
export interface UpdateHeroSlidePayload {
  heading?: Translatable<string>;
  subheading?: Translatable<string>;
  ctaLabel?: Translatable<string>;
  ctaUrl?: string;
  backgroundMediaId?: string | null;
}

/**
 * One entry in a slide's revision history. Mirrors `ContentRevision`
 * (backend `core/revisions/entities/content-revision.entity.ts`) as
 * returned by `GET /admin/hero-slides/:id/revisions`. `snapshot`
 * mirrors `snapshotOf()` in `HeroService` — the editable fields
 * captured at save time, never `id`/`siteId`/`status`/`position`.
 */
export interface CmsHeroSlideRevision {
  id: string;
  entityType: string;
  entityId: string;
  versionNumber: number;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  snapshot: {
    heading: Translatable<string>;
    subheading?: Translatable<string>;
    ctaLabel?: Translatable<string>;
    ctaUrl?: string;
    backgroundMediaId?: string;
  };
}

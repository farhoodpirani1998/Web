/**
 * Types for the CMS Campuses module, mirroring the backend `Campus`
 * entity and its DTOs
 * (`backend/src/modules/website/content/campuses/entities/campus.entity.ts`,
 * `.../campuses/dto/*.ts`). Same "mirror, don't import" reasoning as
 * `types/auth.ts` and `features/cms/news/types.ts` — the admin
 * frontend and the NestJS backend are separate packages with no shared
 * runtime code path.
 *
 * `siteId` (present on the entity via `BaseSiteScopedEntity`) is
 * deliberately not modeled here, same call every other module's
 * `types.ts` makes — nothing in this admin frontend acts on it today
 * (exactly one site exists, resolved server-side).
 *
 * Campuses is one of the backend's revision-enabled types
 * (`CampusesController` exposes `GET /:id/revisions` and a restore
 * route, gated behind `website.revisions:view`/`website.revisions:restore`,
 * same as News/Events/Pages/Teachers) — this module implements a
 * revisions history/restore panel (`CampusRevisionsPanel.tsx`), same
 * reasoning as Events'/Teachers'.
 *
 * Campuses also has a dedicated `/schedule` action
 * (`CampusScheduleControl.tsx`), same idiom as News/Events/Pages/
 * Teachers: `publishAt` gates when the campus's public page actually
 * becomes visible, independent of `status`.
 *
 * Like Teachers (and unlike Events/News), Campuses has a `position`
 * field and a `/reorder` endpoint — same idiom as FAQ/Hero Slides/
 * Gallery/Teachers (see the entity's own doc comment: a campus list
 * has no natural order of its own). `CampusList`/`CampusRow` therefore
 * render drag handles/move buttons the way `TeacherList`/`TeacherRow`
 * do.
 *
 * `title`/`body` mirror the entity: translatable, same shape as
 * News/Events/Pages/Teachers' equivalent fields — unlike Teacher's
 * `fullName`, nothing on Campus is a plain (non-translatable) proper
 * noun.
 */

import type { CmsEntityMeta, CmsPublishStatus, Translatable } from "../types";

/** Mirrors `PublishStatus` (backend) as used on the `Campus` entity. */
export type CmsCampusStatus = CmsPublishStatus;

/**
 * Mirrors the shared `SeoMetadata` embeddable (backend
 * `core/seo/seo-metadata.embeddable.ts`) as it appears on
 * `Campus.seo`. Structurally identical to Teachers' `CmsTeacherSeoMetadata`
 * / Events' `CmsEventSeoMetadata` — duplicated here rather than imported
 * from either, same "no cross-module imports between sibling content
 * modules" precedent every CMS module follows.
 */
export interface CmsCampusSeoMetadata {
  metaTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;
  canonicalUrl?: string;
  noindex: boolean;
}

/** Body shape for the nested `seo` field on create/update payloads. Mirrors `SeoMetadataDto` — every field optional. */
export type CmsCampusSeoMetadataInput = Partial<CmsCampusSeoMetadata>;

/**
 * A single physical campus/branch. Extends `CmsEntityMeta` for
 * `id`/`createdAt`/`updatedAt` rather than redeclaring them, per the
 * convention `features/cms/README.md` documents.
 */
export interface CmsCampus extends CmsEntityMeta {
  title: Translatable<string>;
  slug: string;
  excerpt?: Translatable<string>;
  body: Translatable<string>;
  address?: Translatable<string>;
  mapUrl?: string;
  phone?: string;
  email?: string;
  /** Manual admin ordering — primary sort key for both admin and public listings. */
  position: number;
  /** Reference into core/media, tracked via MediaUsage — never an embedded copy. */
  featuredImageMediaId?: string;
  seo: CmsCampusSeoMetadata;
  /** ISO 8601 timestamp, or absent/undefined when the campus isn't scheduled. */
  publishAt?: string;
  status: CmsCampusStatus;
}

/** Body for `POST /admin/campuses`. Mirrors `CreateCampusDto`. `position` is not settable — a new campus is appended to the end of the current order server-side. */
export interface CreateCampusPayload {
  title: Translatable<string>;
  slug: string;
  excerpt?: Translatable<string>;
  body: Translatable<string>;
  address?: Translatable<string>;
  mapUrl?: string;
  phone?: string;
  email?: string;
  featuredImageMediaId?: string;
  seo?: CmsCampusSeoMetadataInput;
}

/**
 * Body for `PATCH /admin/campuses/:id`. Mirrors `UpdateCampusDto` —
 * `mapUrl`, `phone`, `email`, and `featuredImageMediaId` all accept an
 * explicit `null` to clear the value (that DTO's own comments:
 * "Explicit null clears the … ; undefined leaves it unchanged"), same
 * clearable convention as Events'/Teachers' equivalents. `position` is
 * not editable through this endpoint — see `ReorderCampusesDto`/
 * `reorderCampuses` below.
 */
export interface UpdateCampusPayload {
  title?: Translatable<string>;
  slug?: string;
  excerpt?: Translatable<string>;
  body?: Translatable<string>;
  address?: Translatable<string>;
  mapUrl?: string | null;
  phone?: string | null;
  email?: string | null;
  featuredImageMediaId?: string | null;
  seo?: CmsCampusSeoMetadataInput;
}

/**
 * Body for `PATCH /admin/campuses/:id/schedule`. Mirrors
 * `ScheduleCampusDto` — `publishAt: null` explicitly unschedules the
 * campus's public page; there is no "omit to leave unchanged" case
 * for this dedicated action endpoint, unlike `UpdateCampusPayload`'s
 * fields.
 */
export interface ScheduleCampusPayload {
  publishAt: string | null;
}

/**
 * One entry in a campus's revision history. Mirrors `ContentRevision`
 * (backend `core/revisions/entities/content-revision.entity.ts`) as
 * returned by `GET /admin/campuses/:id/revisions`. `snapshot` mirrors
 * `snapshotOf()` in `CampusesService` — the editable fields captured at
 * save time, never `id`/`siteId`/`status`/`publishAt`/`position`.
 */
export interface CmsCampusRevision {
  id: string;
  entityType: string;
  entityId: string;
  versionNumber: number;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  snapshot: {
    title: Translatable<string>;
    slug: string;
    excerpt?: Translatable<string>;
    body: Translatable<string>;
    address?: Translatable<string>;
    mapUrl?: string;
    phone?: string;
    email?: string;
    featuredImageMediaId?: string;
    seo?: CmsCampusSeoMetadata;
  };
}

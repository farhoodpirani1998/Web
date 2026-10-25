/**
 * Types for the CMS Teachers module, mirroring the backend `Teacher`
 * entity and its DTOs
 * (`backend/src/modules/website/content/teachers/entities/teacher.entity.ts`,
 * `.../teachers/dto/*.ts`). Same "mirror, don't import" reasoning as
 * `types/auth.ts` and `features/cms/news/types.ts` — the admin
 * frontend and the NestJS backend are separate packages with no shared
 * runtime code path.
 *
 * `siteId` (present on the entity via `BaseSiteScopedEntity`) is
 * deliberately not modeled here, same call every other module's
 * `types.ts` makes — nothing in this admin frontend acts on it today
 * (exactly one site exists, resolved server-side).
 *
 * Teachers is one of the backend's revision-enabled types
 * (`TeachersController` exposes `GET /:id/revisions` and a restore
 * route, gated behind `website.revisions:view`/`website.revisions:restore`,
 * same as News/Events/Pages) — this module implements a revisions
 * history/restore panel (`TeacherRevisionsPanel.tsx`), same reasoning
 * as Events'.
 *
 * Teachers also has a dedicated `/schedule` action
 * (`TeacherScheduleControl.tsx`), same idiom as News/Events/Pages:
 * `publishAt` gates when the teacher's public page actually becomes
 * visible, independent of `status`.
 *
 * Unlike Events/News (chronological, no manual order), Teachers has a
 * `position` field and a `/reorder` endpoint — same idiom as FAQ/Hero
 * Slides/Gallery (see the entity's own doc comment: a teacher
 * directory has no natural order of its own). `TeacherList`/
 * `TeacherRow` therefore render drag handles/move buttons the way
 * `FaqList`/`FaqRow` do, not the way `EventList`/`EventRow` (no
 * position) do.
 *
 * `fullName` mirrors the entity: a proper noun, deliberately typed as
 * a plain `string`, NOT `Translatable<string>` — same reasoning as
 * Testimonial.authorName (see the entity's own doc comment).
 */

import type { CmsEntityMeta, CmsPublishStatus, Translatable } from "../types";

/** Mirrors `PublishStatus` (backend) as used on the `Teacher` entity. */
export type CmsTeacherStatus = CmsPublishStatus;

/**
 * Mirrors the shared `SeoMetadata` embeddable (backend
 * `core/seo/seo-metadata.embeddable.ts`) as it appears on
 * `Teacher.seo`. Structurally identical to Events' `CmsEventSeoMetadata`
 * / News' `CmsSeoMetadata` — duplicated here rather than imported from
 * either, same "no cross-module imports between sibling content
 * modules" precedent every CMS module follows.
 */
export interface CmsTeacherSeoMetadata {
  metaTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;
  canonicalUrl?: string;
  noindex: boolean;
}

/** Body shape for the nested `seo` field on create/update payloads. Mirrors `SeoMetadataDto` — every field optional. */
export type CmsTeacherSeoMetadataInput = Partial<CmsTeacherSeoMetadata>;

/**
 * A single teacher/staff profile. Extends `CmsEntityMeta` for
 * `id`/`createdAt`/`updatedAt` rather than redeclaring them, per the
 * convention `features/cms/README.md` documents.
 */
export interface CmsTeacher extends CmsEntityMeta {
  /** Proper noun — plain string, not translatable. See this file's top comment. */
  fullName: string;
  slug: string;
  jobTitle: Translatable<string>;
  excerpt?: Translatable<string>;
  bio: Translatable<string>;
  department?: Translatable<string>;
  /** Plain uuid reference to a Campus, not a relation — validated server-side. No admin Campus picker exists yet; see `TeacherForm`'s comment. */
  campusId?: string;
  phone?: string;
  email?: string;
  /** Manual admin ordering — primary sort key for both admin and public listings. */
  position: number;
  /** Reference into core/media, tracked via MediaUsage — never an embedded copy. */
  avatarMediaId?: string;
  seo: CmsTeacherSeoMetadata;
  /** ISO 8601 timestamp, or absent/undefined when the teacher isn't scheduled. */
  publishAt?: string;
  status: CmsTeacherStatus;
}

/** Body for `POST /admin/teachers`. Mirrors `CreateTeacherDto`. `position` is not settable — a new teacher is appended to the end of the current order server-side. */
export interface CreateTeacherPayload {
  fullName: string;
  slug: string;
  jobTitle: Translatable<string>;
  excerpt?: Translatable<string>;
  bio: Translatable<string>;
  department?: Translatable<string>;
  campusId?: string;
  phone?: string;
  email?: string;
  avatarMediaId?: string;
  seo?: CmsTeacherSeoMetadataInput;
}

/**
 * Body for `PATCH /admin/teachers/:id`. Mirrors `UpdateTeacherDto` —
 * `campusId`, `phone`, `email`, and `avatarMediaId` all accept an
 * explicit `null` to clear the value (that DTO's own comments:
 * "Explicit null clears the … ; undefined leaves it unchanged"), same
 * clearable convention as Events' `featuredImageMediaId`. `position`
 * is not editable through this endpoint — see `ReorderTeachersDto`/
 * `reorderTeachers` below.
 */
export interface UpdateTeacherPayload {
  fullName?: string;
  slug?: string;
  jobTitle?: Translatable<string>;
  excerpt?: Translatable<string>;
  bio?: Translatable<string>;
  department?: Translatable<string>;
  campusId?: string | null;
  phone?: string | null;
  email?: string | null;
  avatarMediaId?: string | null;
  seo?: CmsTeacherSeoMetadataInput;
}

/**
 * Body for `PATCH /admin/teachers/:id/schedule`. Mirrors
 * `ScheduleTeacherDto` — `publishAt: null` explicitly unschedules the
 * teacher's public page; there is no "omit to leave unchanged" case
 * for this dedicated action endpoint, unlike `UpdateTeacherPayload`'s
 * fields.
 */
export interface ScheduleTeacherPayload {
  publishAt: string | null;
}

/**
 * One entry in a teacher's revision history. Mirrors `ContentRevision`
 * (backend `core/revisions/entities/content-revision.entity.ts`) as
 * returned by `GET /admin/teachers/:id/revisions`. `snapshot` mirrors
 * `snapshotOf()` in `TeachersService` — the editable fields captured at
 * save time, never `id`/`siteId`/`status`/`publishAt`/`position`.
 */
export interface CmsTeacherRevision {
  id: string;
  entityType: string;
  entityId: string;
  versionNumber: number;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  snapshot: {
    fullName: string;
    slug: string;
    jobTitle: Translatable<string>;
    excerpt?: Translatable<string>;
    bio: Translatable<string>;
    department?: Translatable<string>;
    campusId?: string;
    phone?: string;
    email?: string;
    avatarMediaId?: string;
    seo?: CmsTeacherSeoMetadata;
  };
}

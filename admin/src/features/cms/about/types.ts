/**
 * Types for the CMS About module, mirroring the backend `AboutPage`
 * entity and its DTOs
 * (`backend/src/modules/website/content/about/entities/about.entity.ts`,
 * `.../about/dto/*.ts`). Same "mirror, don't import" reasoning as
 * `features/cms/campuses/types.ts` and `features/cms/site-settings/types.ts`
 * — the admin frontend and the NestJS backend are separate packages
 * with no shared runtime code path.
 *
 * `siteId` (present on the entity via `BaseSiteScopedEntity`) is
 * deliberately not modeled here, same call every other module's
 * `types.ts` makes — nothing in this admin frontend acts on it today
 * (exactly one site exists, resolved server-side).
 *
 * About is a **singleton per site** (`@Unique(['siteId'])` on the
 * entity, `AboutService.onModuleInit` auto-seeds the one row) — same
 * shape as `features/cms/site-settings/types.ts`, not a list like
 * Campuses/Teachers/News. There is no create/delete endpoint and no
 * `position`/reorder: `AboutController` exposes exactly `GET`, `PATCH`,
 * `PATCH /status`, `GET /revisions`, and `POST /revisions/:v/restore`,
 * none of which take an `:id`.
 *
 * About IS its own indexable public page (unlike Features/Testimonials/
 * Statistics), so — like Campuses/Teachers/Pages/News/Events — it
 * carries `seo` and is one of the backend's revision-enabled types
 * (`RevisionsService.REVISION_ENABLED_TYPES` includes `'about'`). This
 * module therefore implements a revisions history/restore panel
 * (`AboutRevisionsPanel.tsx`), same reasoning as Campuses'/Teachers'.
 * Unlike Campuses, there is no `/schedule` action on `AboutController`
 * — no `publishAt` field here.
 */

import type { CmsEntityMeta, CmsPublishStatus, Translatable } from "../types";

/** Mirrors `PublishStatus` (backend) as used on the `AboutPage` entity. */
export type CmsAboutStatus = CmsPublishStatus;

/**
 * Mirrors the shared `SeoMetadata` embeddable (backend
 * `core/seo/seo-metadata.embeddable.ts`) as it appears on
 * `AboutPage.seo`. Structurally identical to Campuses' `CmsCampusSeoMetadata`
 * — duplicated here rather than imported from it, same "no cross-module
 * imports between sibling content modules" precedent every CMS module
 * follows.
 */
export interface CmsAboutSeoMetadata {
  metaTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;
  canonicalUrl?: string;
  noindex: boolean;
}

/** Body shape for the nested `seo` field on the update payload. Mirrors `SeoMetadataDto` — every field optional. */
export type CmsAboutSeoMetadataInput = Partial<CmsAboutSeoMetadata>;

/**
 * The singleton About page row. Extends `CmsEntityMeta` for
 * `id`/`createdAt`/`updatedAt` rather than redeclaring them, per the
 * convention `features/cms/README.md` documents — there is always
 * exactly one of these (`AboutService` auto-seeds it), never a list.
 */
export interface CmsAbout extends CmsEntityMeta {
  title: Translatable<string>;
  body: Translatable<string>;
  /** Reference into core/media, tracked via MediaUsage — never an embedded copy. */
  imageMediaId?: string;
  seo: CmsAboutSeoMetadata;
  status: CmsAboutStatus;
}

/**
 * Body for `PATCH /admin/about`. Mirrors `UpdateAboutDto` —
 * `imageMediaId` accepts an explicit `null` to clear the reference
 * (that DTO's own comment: "Explicit null clears the image; undefined
 * leaves it unchanged"), same clearable convention as Campuses'
 * `featuredImageMediaId`.
 */
export interface UpdateAboutPayload {
  title?: Translatable<string>;
  body?: Translatable<string>;
  imageMediaId?: string | null;
  seo?: CmsAboutSeoMetadataInput;
}

/**
 * One entry in the About page's revision history. Mirrors
 * `ContentRevision` (backend
 * `core/revisions/entities/content-revision.entity.ts`) as returned by
 * `GET /admin/about/revisions`. `snapshot` mirrors `snapshotOf()` in
 * `AboutService` — the editable fields captured at save time, never
 * `id`/`siteId`/`status`.
 */
export interface CmsAboutRevision {
  id: string;
  entityType: string;
  entityId: string;
  versionNumber: number;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  snapshot: {
    title: Translatable<string>;
    body: Translatable<string>;
    imageMediaId?: string;
    seo?: CmsAboutSeoMetadata;
  };
}

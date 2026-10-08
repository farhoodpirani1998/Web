/**
 * Types for the CMS Pages module, mirroring the backend `StaticPage`
 * entity and its DTOs
 * (`backend/src/modules/website/content/pages/entities/page.entity.ts`,
 * `.../pages/dto/*.ts`). Same "mirror, don't import" reasoning as
 * `features/cms/news/types.ts` — see that file's top comment.
 *
 * `siteId` is deliberately not modeled here, same call every other
 * module's `types.ts` makes.
 *
 * Pages is one of the backend's 4 revision-enabled types
 * (`entityType: 'static_page'`) — same as News, this module implements
 * a revisions history/restore panel (`PageRevisionsPanel.tsx`).
 *
 * No `position`/`reorder` endpoint — same reasoning as News: pages
 * aren't a manually-dragged sequence (see the entity's own doc
 * comment). `parentId` gives pages a hierarchy for admin organization,
 * but that's a tree relationship, not an ordering.
 */

import type { CmsEntityMeta, CmsPublishStatus, Translatable } from "../types";

/** Mirrors `PublishStatus` (backend) as used on the `StaticPage` entity. Same union as News' `CmsNewsStatus`. */
export type CmsPageStatus = CmsPublishStatus;

/**
 * Mirrors the shared `SeoMetadata` embeddable (backend
 * `core/seo/seo-metadata.embeddable.ts`) as it appears on
 * `StaticPage.seo`. Structurally identical to News'
 * `CmsSeoMetadata` — duplicated here rather than imported from
 * `features/cms/news/types`, same "no cross-module imports between
 * sibling content modules" precedent every other CMS module already
 * follows (each module mirrors shared backend shapes locally; see
 * `features/cms/news/types.ts`'s own top comment).
 */
export interface CmsPageSeoMetadata {
  metaTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;
  canonicalUrl?: string;
  noindex: boolean;
}

/** Body shape for the nested `seo` field on create/update payloads. Mirrors `SeoMetadataDto` — every field optional. */
export type CmsPageSeoMetadataInput = Partial<CmsPageSeoMetadata>;

/**
 * Mirrors `PageTemplate` (backend
 * `entities/page-template.enum.ts`) — a fixed, code-defined set of
 * layout templates. Extend only when the backend enum actually grows a
 * new value, not preemptively (see that enum's own doc comment).
 */
export type CmsPageTemplate = "default" | "full_width" | "landing" | "contact" | "sidebar";

export const CMS_PAGE_TEMPLATES: CmsPageTemplate[] = [
  "default",
  "full_width",
  "landing",
  "contact",
  "sidebar",
];

/**
 * A generic content page (admissions policy, campus life, a landing
 * page, etc.). Unlike News, there's no `category`/`tags`/`excerpt` —
 * the entity simply doesn't have those fields.
 */
export interface CmsPage extends CmsEntityMeta {
  title: Translatable<string>;
  slug: string;
  body: Translatable<string>;
  template: CmsPageTemplate;
  /** References another page's `id` on the same site. `undefined` for a top-level page. */
  parentId?: string;
  showInMenu: boolean;
  isHomepage: boolean;
  featuredImageMediaId?: string;
  seo: CmsPageSeoMetadata;
  /** ISO 8601 timestamp, or absent/undefined when the page isn't scheduled. */
  publishAt?: string;
  status: CmsPageStatus;
}

/** Body for `POST /admin/pages`. Mirrors `CreatePageDto`. `isHomepage` is deliberately not settable here — see `setPageHomepage`. */
export interface CreatePagePayload {
  title: Translatable<string>;
  slug: string;
  body: Translatable<string>;
  template?: CmsPageTemplate;
  parentId?: string;
  showInMenu?: boolean;
  featuredImageMediaId?: string;
  seo?: CmsPageSeoMetadataInput;
}

/**
 * Body for `PATCH /admin/pages/:id`. Mirrors `UpdatePageDto` —
 * `parentId` and `featuredImageMediaId` both accept an explicit `null`
 * to clear the reference (moves the page back to top-level, or clears
 * the image, respectively); `undefined` leaves each unchanged, same
 * "explicit null clears it" convention as News.
 */
export interface UpdatePagePayload {
  title?: Translatable<string>;
  slug?: string;
  body?: Translatable<string>;
  template?: CmsPageTemplate;
  parentId?: string | null;
  showInMenu?: boolean;
  featuredImageMediaId?: string | null;
  seo?: CmsPageSeoMetadataInput;
}

/** Body for `PATCH /admin/pages/:id/schedule`. Mirrors `SchedulePageDto` — identical idiom to News' `ScheduleNewsArticlePayload`. */
export interface SchedulePagePayload {
  publishAt: string | null;
}

/**
 * Body for `PATCH /admin/pages/:id/homepage`. Mirrors
 * `SetPageHomepageDto` — a dedicated action, not a plain field edit
 * via `UpdatePagePayload`, since designating the homepage has the side
 * effect of unsetting whichever other page previously held it (see
 * `PagesService.setHomepage`'s own comment). The backend only accepts
 * this when the target page is already `published`.
 */
export interface SetPageHomepagePayload {
  isHomepage: boolean;
}

/**
 * One entry in a page's revision history. Mirrors `ContentRevision` as
 * returned by `GET /admin/pages/:id/revisions` — same shape as News'
 * `CmsNewsRevision`, but `snapshot` mirrors Pages' own `snapshotOf()`
 * (never `id`/`status`/`publishAt`/`isHomepage` — workflow metadata
 * decided through dedicated endpoints, not editorial content).
 */
export interface CmsPageRevision {
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
    body: Translatable<string>;
    template?: CmsPageTemplate;
    parentId?: string;
    showInMenu?: boolean;
    featuredImageMediaId?: string;
    seo?: CmsPageSeoMetadata;
  };
}

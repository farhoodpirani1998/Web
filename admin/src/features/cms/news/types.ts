/**
 * Types for the CMS News module, mirroring the backend `NewsArticle`
 * entity and its DTOs
 * (`backend/src/modules/website/content/news/entities/news-article.entity.ts`,
 * `.../news/dto/*.ts`). Same "mirror, don't import" reasoning as
 * `types/auth.ts` and `features/cms/hero-slides/types.ts` — the admin
 * frontend and the NestJS backend are separate packages with no shared
 * runtime code path.
 *
 * `siteId` (present on the entity via `BaseSiteScopedEntity`) is
 * deliberately not modeled here, same call every other module's
 * `types.ts` makes — nothing in this admin frontend acts on it today
 * (exactly one site exists, resolved server-side).
 *
 * News is one of the backend's 4 revision-enabled types
 * (`NewsController` exposes `GET /:id/revisions` and a restore route,
 * gated behind `website.revisions:view`/`website.revisions:restore`) —
 * unlike Hero (Sprint 3.8/3.9), this sprint's UI does implement a
 * revisions history/restore panel (`NewsRevisionsPanel.tsx`), since
 * both permissions already exist on `AdminPermission`
 * (`types/auth.ts`) and News' own entity doc calls itself out as "high
 * cost to accidentally lose, worth diffing/restoring".
 *
 * No `position`/no `reorder` endpoint: unlike Gallery/Hero/FAQ/Portal
 * Links, a news feed's natural order is reverse-chronological
 * (`publishAt`/`createdAt`), not a manually dragged sequence — see the
 * entity's own doc comment. `NewsList` therefore never renders drag
 * handles/move buttons the way `FaqList`/`HeroSlideList` do.
 */

import type { CmsEntityMeta, CmsPublishStatus, Translatable } from "../types";

/** Mirrors `PublishStatus` (backend) as used on the `NewsArticle` entity. */
export type CmsNewsStatus = CmsPublishStatus;

/**
 * Mirrors the shared `SeoMetadata` embeddable (backend
 * `core/seo/seo-metadata.embeddable.ts`) as it appears on `NewsArticle.seo`.
 * `noindex` always has a value server-side (`@Column({ default: false })`),
 * so it's typed as required here, unlike the optional string fields.
 */
export interface CmsSeoMetadata {
  metaTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;
  canonicalUrl?: string;
  noindex: boolean;
}

/** Body shape for the nested `seo` field on create/update payloads. Mirrors `SeoMetadataDto` — every field optional. */
export type CmsSeoMetadataInput = Partial<CmsSeoMetadata>;

/**
 * A single news/announcement article. Extends `CmsEntityMeta` for
 * `id`/`createdAt`/`updatedAt` rather than redeclaring them, per the
 * convention `features/cms/README.md` documents.
 */
export interface CmsNewsArticle extends CmsEntityMeta {
  title: Translatable<string>;
  slug: string;
  excerpt?: Translatable<string>;
  body: Translatable<string>;
  category?: string;
  tags?: string[];
  featuredImageMediaId?: string;
  seo: CmsSeoMetadata;
  /** ISO 8601 timestamp, or absent/undefined when the article isn't scheduled. */
  publishAt?: string;
  status: CmsNewsStatus;
}

/** Body for `POST /admin/news`. Mirrors `CreateNewsArticleDto`. */
export interface CreateNewsArticlePayload {
  title: Translatable<string>;
  slug: string;
  excerpt?: Translatable<string>;
  body: Translatable<string>;
  category?: string;
  tags?: string[];
  featuredImageMediaId?: string;
  seo?: CmsSeoMetadataInput;
}

/**
 * Body for `PATCH /admin/news/:id`. Mirrors `UpdateNewsArticleDto` —
 * `featuredImageMediaId` accepts an explicit `null` to clear the
 * reference (that DTO's own comment: "Explicit null clears the
 * featured image; undefined leaves it unchanged"), same clearable-media
 * convention as Hero's `backgroundMediaId`.
 */
export interface UpdateNewsArticlePayload {
  title?: Translatable<string>;
  slug?: string;
  excerpt?: Translatable<string>;
  body?: Translatable<string>;
  category?: string;
  tags?: string[];
  featuredImageMediaId?: string | null;
  seo?: CmsSeoMetadataInput;
}

/**
 * Body for `PATCH /admin/news/:id/schedule`. Mirrors
 * `ScheduleNewsArticleDto` — `publishAt: null` explicitly unschedules
 * the article; there is no "omit to leave unchanged" case for this
 * dedicated action endpoint, unlike `UpdateNewsArticlePayload`'s fields.
 */
export interface ScheduleNewsArticlePayload {
  publishAt: string | null;
}

/**
 * One entry in an article's revision history. Mirrors `ContentRevision`
 * (backend `core/revisions/entities/content-revision.entity.ts`) as
 * returned by `GET /admin/news/:id/revisions`. `snapshot` mirrors
 * `snapshotOf()` in `NewsService` — the editable fields captured at
 * save time, never `id`/`status`/`publishAt`.
 */
export interface CmsNewsRevision {
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
    category?: string;
    tags?: string[];
    featuredImageMediaId?: string;
    seo?: CmsSeoMetadata;
  };
}

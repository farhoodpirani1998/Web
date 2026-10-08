/**
 * Types for the CMS Events module, mirroring the backend `CalendarEvent`
 * entity and its DTOs
 * (`backend/src/modules/website/content/events/entities/calendar-event.entity.ts`,
 * `.../events/dto/*.ts`). Same "mirror, don't import" reasoning as
 * `types/auth.ts` and `features/cms/news/types.ts` — the admin
 * frontend and the NestJS backend are separate packages with no shared
 * runtime code path.
 *
 * `siteId` (present on the entity via `BaseSiteScopedEntity`) is
 * deliberately not modeled here, same call every other module's
 * `types.ts` makes — nothing in this admin frontend acts on it today
 * (exactly one site exists, resolved server-side).
 *
 * Events is one of the backend's revision-enabled types
 * (`EventsController` exposes `GET /:id/revisions` and a restore
 * route, gated behind `website.revisions:view`/`website.revisions:restore`,
 * same as News/Pages) — this module implements a revisions history/
 * restore panel (`EventRevisionsPanel.tsx`), same reasoning as News'.
 *
 * Events also has a dedicated `/schedule` action
 * (`EventScheduleControl.tsx`), same idiom as News/Pages: `publishAt`
 * gates when the *listing itself* becomes visible, and is deliberately
 * distinct from `startAt`/`endAt` (when the event happens) — see the
 * entity's own doc comment.
 *
 * No `position`/no `reorder` endpoint: like News, an events list has a
 * natural order — chronological by `startAt` — not a manually dragged
 * sequence (see the entity's own doc comment). `EventList` therefore
 * never renders drag handles/move buttons the way `FaqList`/
 * `HeroSlideList` do.
 */

import type { CmsEntityMeta, CmsPublishStatus, Translatable } from "../types";

/** Mirrors `PublishStatus` (backend) as used on the `CalendarEvent` entity. */
export type CmsEventStatus = CmsPublishStatus;

/**
 * Mirrors the shared `SeoMetadata` embeddable (backend
 * `core/seo/seo-metadata.embeddable.ts`) as it appears on
 * `CalendarEvent.seo`. Structurally identical to News' `CmsSeoMetadata`
 * / Pages' `CmsPageSeoMetadata` — duplicated here rather than imported
 * from either, same "no cross-module imports between sibling content
 * modules" precedent every CMS module follows (each module mirrors
 * shared backend shapes locally; see `features/cms/news/types.ts`'s
 * own top comment).
 */
export interface CmsEventSeoMetadata {
  metaTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;
  canonicalUrl?: string;
  noindex: boolean;
}

/** Body shape for the nested `seo` field on create/update payloads. Mirrors `SeoMetadataDto` — every field optional. */
export type CmsEventSeoMetadataInput = Partial<CmsEventSeoMetadata>;

/**
 * A single calendar event (open house, fundraiser, graduation, etc.).
 * Extends `CmsEntityMeta` for `id`/`createdAt`/`updatedAt` rather than
 * redeclaring them, per the convention `features/cms/README.md`
 * documents.
 */
export interface CmsCalendarEvent extends CmsEntityMeta {
  title: Translatable<string>;
  slug: string;
  excerpt?: Translatable<string>;
  body: Translatable<string>;
  category?: string;
  tags?: string[];
  location?: Translatable<string>;
  locationUrl?: string;
  /** ISO 8601 timestamp — when the event happens. Always present. */
  startAt: string;
  /** ISO 8601 timestamp, or absent/undefined when the event has no end time. */
  endAt?: string;
  allDay: boolean;
  featuredImageMediaId?: string;
  seo: CmsEventSeoMetadata;
  /** ISO 8601 timestamp, or absent/undefined when the event isn't scheduled. */
  publishAt?: string;
  status: CmsEventStatus;
}

/** Body for `POST /admin/events`. Mirrors `CreateCalendarEventDto`. */
export interface CreateCalendarEventPayload {
  title: Translatable<string>;
  slug: string;
  excerpt?: Translatable<string>;
  body: Translatable<string>;
  category?: string;
  tags?: string[];
  location?: Translatable<string>;
  locationUrl?: string;
  startAt: string;
  endAt?: string;
  allDay?: boolean;
  featuredImageMediaId?: string;
  seo?: CmsEventSeoMetadataInput;
}

/**
 * Body for `PATCH /admin/events/:id`. Mirrors `UpdateCalendarEventDto` —
 * `locationUrl`, `endAt`, and `featuredImageMediaId` all accept an
 * explicit `null` to clear the value (that DTO's own comments: "Explicit
 * null clears the … ; undefined leaves it unchanged"), same clearable
 * convention as News' `featuredImageMediaId`.
 */
export interface UpdateCalendarEventPayload {
  title?: Translatable<string>;
  slug?: string;
  excerpt?: Translatable<string>;
  body?: Translatable<string>;
  category?: string;
  tags?: string[];
  location?: Translatable<string>;
  locationUrl?: string | null;
  startAt?: string;
  endAt?: string | null;
  allDay?: boolean;
  featuredImageMediaId?: string | null;
  seo?: CmsEventSeoMetadataInput;
}

/**
 * Body for `PATCH /admin/events/:id/schedule`. Mirrors
 * `ScheduleCalendarEventDto` — `publishAt: null` explicitly unschedules
 * the event's listing; there is no "omit to leave unchanged" case for
 * this dedicated action endpoint, unlike `UpdateCalendarEventPayload`'s
 * fields.
 */
export interface ScheduleCalendarEventPayload {
  publishAt: string | null;
}

/**
 * One entry in an event's revision history. Mirrors `ContentRevision`
 * (backend `core/revisions/entities/content-revision.entity.ts`) as
 * returned by `GET /admin/events/:id/revisions`. `snapshot` mirrors
 * `snapshotOf()` in `EventsService` — the editable fields captured at
 * save time, never `id`/`status`/`publishAt`.
 */
export interface CmsEventRevision {
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
    location?: Translatable<string>;
    locationUrl?: string;
    startAt: string;
    endAt?: string;
    allDay: boolean;
    featuredImageMediaId?: string;
    seo?: CmsEventSeoMetadata;
  };
}

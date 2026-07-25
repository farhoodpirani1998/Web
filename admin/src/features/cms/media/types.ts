/**
 * Types for the CMS media library, mirroring the backend `Media` entity
 * (`backend/src/modules/website/core/media/entities/media.entity.ts`).
 * Same "mirror, don't import" reasoning as `types/auth.ts` and
 * `features/cms/types.ts` — the admin frontend and the NestJS backend
 * are separate packages with no shared runtime code path.
 *
 * Every content entity across every future CMS module (News, Pages,
 * Gallery, …) references media by id only — a `mediaId` field, never an
 * embedded/resolved media object (see the Sprint 3.3 audit, §3 "Media
 * relations"). This file is what a `mediaId` resolves to, via
 * `useMediaById` (`./useMediaById.ts`), not something content DTOs
 * import directly.
 */

import type { CmsEntityMeta } from "../types";

/** Mirrors `MediaStatus` (backend). */
export type CmsMediaStatus = "active" | "archived";

/**
 * A single media library asset. Extends `CmsEntityMeta` for
 * `id`/`createdAt`/`updatedAt` rather than redeclaring them, per the
 * convention `features/cms/README.md` documents.
 *
 * `thumbnailUrl`/`cardUrl` are optional to match the backend column
 * (`nullable: true`) — not every storage provider/asset produces them,
 * so callers needing an image must fall back to `url`.
 *
 * `usageCount` mirrors `MediaWithUsageCount` (backend) — only
 * `GET /admin/media` (`fetchMediaList`) populates it; `GET
 * /admin/media/:id` (`fetchMediaById`) returns the plain `Media` row
 * without it, so it's optional here rather than assumed present.
 */
export interface CmsMedia extends CmsEntityMeta {
  url: string;
  thumbnailUrl?: string;
  cardUrl?: string;
  mimeType: string;
  sizeBytes: number;
  altText: string;
  status: CmsMediaStatus;
  usageCount?: number;
}

/**
 * Mirrors `MediaUsage` (backend) — one row per content entity currently
 * referencing a media asset. Returned by `GET /admin/media/:id/usage`
 * (`fetchMediaUsage`), backing the usage-details view.
 */
export interface CmsMediaUsage extends CmsEntityMeta {
  mediaId: string;
  entityType: string;
  entityId: string;
}

/**
 * Body for `POST /admin/media`. The file itself travels as multipart
 * form data (see `uploadMedia` in `./api.ts`) — this is only the
 * non-file field the backend's `UploadMediaDto` requires alongside it.
 */
export interface UploadMediaPayload {
  file: File;
  altText: string;
}

/**
 * Cross-module CMS conventions shared by every future content module
 * (News, Pages, Gallery, etc.) — NOT a business entity itself.
 *
 * These mirror backend conventions that every content module already
 * follows (see `backend/src/modules/website/core/`), rather than
 * anything module-specific:
 *   - `core/common/base.entity.ts` (`id`/`createdAt`/`updatedAt`)
 *   - `core/publishing/publish-status.enum.ts` (`PublishStatus`)
 *   - `core/i18n/locale.enum.ts` (`Locale`, `Translatable<T>`)
 *
 * Same "mirror, don't import" reasoning as `types/auth.ts`: the admin
 * frontend and the NestJS backend are separate packages/deploys with no
 * shared runtime code path, so these are kept in lockstep by hand. If
 * the backend types change, update this file to match.
 *
 * No pagination type here: no CMS admin list endpoint paginates today
 * (`GET /admin/news`, etc. all return a plain array) — add one if/when
 * a real endpoint needs it, not speculatively.
 */

/** Mirrors `Locale` (backend). String union, not a TS `enum` — same
 *  reasoning as `AdminRole`/`AdminPermission` in `types/auth.ts`: no
 *  runtime footprint, just types. */
export type CmsLocale = "fa" | "en";

/** Mirrors `DEFAULT_LOCALE` (backend) — Farsi is always required on a
 *  translatable field; other locales are optional. */
export const CMS_DEFAULT_LOCALE: CmsLocale = "fa";

/**
 * Mirrors `Translatable<T>` (backend). Convention, not enforcement —
 * same as the backend comment: modules adopt this per-field, not every
 * field on every entity needs to be translatable.
 */
export type Translatable<T = string> = Partial<Record<CmsLocale, T>> & {
  [CMS_DEFAULT_LOCALE]: T;
};

/** Mirrors `PublishStatus` (backend). */
export type CmsPublishStatus = "draft" | "published" | "archived";

/**
 * Common metadata every content module's entity carries, mirroring
 * `BaseEntity` (backend). Module-specific `types.ts` files should
 * extend this rather than redeclaring `id`/`createdAt`/`updatedAt`
 * themselves.
 *
 * Dates are typed as `string` (ISO 8601, as serialized over HTTP), not
 * `Date` — nothing in this admin frontend deserializes response bodies
 * into `Date` instances today.
 */
export interface CmsEntityMeta {
  id: string;
  createdAt: string;
  updatedAt: string;
}

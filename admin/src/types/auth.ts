/**
 * Shared auth types for the CMS Admin frontend.
 *
 * These are intentionally kept in lockstep with the CMS backend's own
 * types rather than imported from it (the admin frontend and the NestJS
 * backend are separate packages/deploys) — see:
 *   - `backend/src/modules/website/auth/website-role.enum.ts`
 *   - `backend/src/modules/website/identity/auth/cms-auth.service.ts`
 *     (`SafeAdminIdentity`, `SafeAdminIdentityWithPermissions`, `LoginResult`)
 *
 * If those backend types change, update this file to match.
 */

/**
 * Mirrors `WebsiteRole` (backend). A string union rather than a TS `enum`
 * so this file has no runtime footprint — just types.
 */
export type AdminRole =
  | "website_super_admin"
  | "content_editor"
  | "publisher"
  | "seo_marketing_manager"
  | "media_manager";

/** Mirrors `WebsitePermission` (backend). */
export type AdminPermission =
  | "website.content:read"
  | "website.content:write"
  | "website.content:publish"
  | "website.media:manage"
  | "website.seo:manage"
  | "website.feature_flags:manage"
  | "website.revisions:view"
  | "website.revisions:restore";

/**
 * The authenticated admin's identity as returned by the CMS backend.
 * Mirrors `SafeAdminIdentity` / `SafeAdminIdentityWithPermissions` —
 * `permissions` is only present on the `/admin/auth/me` response, not on
 * login, so it's modeled as optional here rather than as two separate
 * exported types.
 */
export interface AdminUser {
  id: string;
  email: string;
  role: AdminRole;
  permissions?: AdminPermission[];
}

/** Request body for `POST /admin/auth/login`. */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Response body for `POST /admin/auth/login`. Mirrors `LoginResult`.
 * `POST /admin/auth/refresh` (Sprint — Persistent Login) returns this
 * same shape — see `CmsAuthController.refresh`, which reuses
 * `LoginResult` on the backend too.
 */
export interface LoginResponse {
  accessToken: string;
  admin: AdminUser;
}

/**
 * Response body for `GET /admin/auth/me`. Same shape as `AdminUser` with
 * `permissions` always present — aliased separately so call sites can
 * express that expectation without an optional-chaining check.
 */
export type CurrentAdminResponse = Required<AdminUser>;

import type { AdminPermission, AdminRole, AdminUser } from "@/types/auth";

/**
 * Framework-independent permission/role helpers.
 *
 * Sprint 2.5: these are pure functions over `AdminUser` — no React, no
 * store access, no API calls. They exist so "can this user do X" logic
 * lives in exactly one place instead of being reimplemented at each
 * call site (or, worse, each call site re-deriving its own notion of
 * what a role implies).
 *
 * Deliberately NOT reimplementing `ROLE_PERMISSIONS` (the backend's
 * role -> permission map, see `website-role.enum.ts`): these helpers
 * only ever check the `permissions` array the backend already computed
 * and sent back on `/admin/auth/me`. The frontend has no business
 * deciding what a role is allowed to do — that's backend-owned. If
 * `user.permissions` is missing (e.g. the `LoginResponse` shape, which
 * doesn't include it), permission checks simply fail closed rather than
 * guessing from `role`.
 */

/** True if `user` is present and has exactly the given role. */
export function hasRole(
  user: Pick<AdminUser, "role"> | null | undefined,
  role: AdminRole,
): boolean {
  return user?.role === role;
}

/** True if `user` is present and its role is one of `roles`. */
export function hasAnyRole(
  user: Pick<AdminUser, "role"> | null | undefined,
  roles: AdminRole[],
): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

/**
 * True if `user` is present, has a `permissions` list (only guaranteed
 * on the `/admin/auth/me` response, see `CurrentAdminResponse`), and
 * that list includes `permission`.
 */
export function hasPermission(
  user: Pick<AdminUser, "permissions"> | null | undefined,
  permission: AdminPermission,
): boolean {
  return user?.permissions?.includes(permission) ?? false;
}

/** True if `user` has at least one of `permissions`. */
export function hasAnyPermission(
  user: Pick<AdminUser, "permissions"> | null | undefined,
  permissions: AdminPermission[],
): boolean {
  if (!user?.permissions) return false;
  return permissions.some((permission) => user.permissions!.includes(permission));
}

/** True if `user` has every permission in `permissions`. */
export function hasAllPermissions(
  user: Pick<AdminUser, "permissions"> | null | undefined,
  permissions: AdminPermission[],
): boolean {
  if (!user?.permissions) return false;
  return permissions.every((permission) => user.permissions!.includes(permission));
}

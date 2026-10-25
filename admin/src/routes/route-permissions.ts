/**
 * Route-level permission requirements for the admin SPA.
 *
 * This is a *navigation* concern, not a security boundary — the backend's
 * `@RequireCmsPermission(...)` decorators on each endpoint are what
 * actually authorize an action. What lives here mirrors, per page, the
 * permission the backend demands for that page's very first request, so
 * an admin is never shown a link or a shell that is guaranteed to answer
 * their next click with a 403.
 *
 * Deliberately sparse: only pages whose backing read endpoint demands
 * more than `website.content:read` are listed. Every CMS role holds
 * `website.content:read` (see `ROLE_PERMISSIONS` in
 * `backend/src/modules/website/auth/website-role.enum.ts`), so gating the
 * rest would change nothing for any real user — and a blanket default
 * would turn a temporarily-missing `permissions` array into a locked-out
 * admin panel instead of a single denied page.
 *
 * `AdminSidebar` filters its links and `RequireRouteAccess` guards the
 * matched route from this same map, so the two can never disagree about
 * what a given admin may open.
 */
import { hasPermission } from "@/lib/permissions";
import { ROUTE_PATHS } from "@/routes/paths";
import type { AdminPermission, AdminUser } from "@/types/auth";

/**
 * Exact admin paths -> permission their landing request needs. Keys are
 * `ROUTE_PATHS` values, never literals, so renaming a route can't leave a
 * stale requirement behind.
 */
export const ROUTE_PERMISSIONS: Record<string, AdminPermission> = {
  [ROUTE_PATHS.ADMIN_MEDIA]: "website.media:manage",
  [ROUTE_PATHS.ADMIN_ADMIN_USERS]: "website.admins:manage",
};

/**
 * The permission required to view `pathname`, or `undefined` when any
 * authenticated admin may. Matches a map key exactly or as a path prefix,
 * so a future detail route under a gated section (e.g. `/admin/media/123`)
 * inherits the gate instead of slipping past it.
 */
export function requiredPermissionForPath(pathname: string): AdminPermission | undefined {
  for (const [path, permission] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname === path || pathname.startsWith(`${path}/`)) {
      return permission;
    }
  }
  return undefined;
}

/**
 * True when `admin` may see the page at `pathname`. Fails closed: an
 * unknown role, a `permissions` array that never arrived, or a
 * permission list that simply lacks the requirement all deny.
 */
export function canAccessRoute(
  admin: Pick<AdminUser, "permissions"> | null | undefined,
  pathname: string,
): boolean {
  const required = requiredPermissionForPath(pathname);
  return required === undefined || hasPermission(admin, required);
}

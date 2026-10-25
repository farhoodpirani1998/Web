import { describe, expect, it } from "vitest";

import type { AdminPermission, AdminRole, AdminUser } from "@/types/auth";

import { ROUTE_PATHS } from "./paths";
import { canAccessRoute, requiredPermissionForPath } from "./route-permissions";

/**
 * These requirements are a mirror of what the backend asks for on each
 * page's first request — if `ROUTE_PERMISSIONS` drifts from the
 * `@RequireCmsPermission` decorators, the sidebar hides a page an admin
 * could use, or shows one that 403s them. The expectations below are
 * written against the backend's strings on purpose, not re-derived from
 * this map.
 */
function adminWith(role: AdminRole, permissions: AdminPermission[]): AdminUser {
  return { id: "admin-1", email: "admin@example.com", role, permissions };
}

const CONTENT_EDITOR = adminWith("content_editor", [
  "website.content:read",
  "website.content:write",
  "website.revisions:view",
]);

const MEDIA_MANAGER = adminWith("media_manager", [
  "website.content:read",
  "website.media:manage",
]);

const SUPER_ADMIN = adminWith("website_super_admin", [
  "website.content:read",
  "website.media:manage",
  "website.admins:manage",
]);

describe("requiredPermissionForPath", () => {
  it("requires media management for the media library", () => {
    expect(requiredPermissionForPath(ROUTE_PATHS.ADMIN_MEDIA)).toBe(
      "website.media:manage",
    );
  });

  it("requires admin management for the admin users page", () => {
    expect(requiredPermissionForPath(ROUTE_PATHS.ADMIN_ADMIN_USERS)).toBe(
      "website.admins:manage",
    );
  });

  it("applies a section's requirement to paths nested under it", () => {
    expect(requiredPermissionForPath("/admin/media/asset-7")).toBe(
      "website.media:manage",
    );
  });

  it("does not let a prefix collide with a sibling section", () => {
    expect(requiredPermissionForPath("/admin/media-usage-stats")).toBeUndefined();
  });

  it("requires nothing for the sections every role can open", () => {
    for (const path of [
      ROUTE_PATHS.ADMIN_DASHBOARD,
      ROUTE_PATHS.ADMIN_NEWS,
      ROUTE_PATHS.ADMIN_AUDIT_LOG,
      ROUTE_PATHS.ADMIN_SETTINGS,
    ]) {
      expect(requiredPermissionForPath(path)).toBeUndefined();
    }
  });
});

describe("canAccessRoute", () => {
  it("lets an admin through an ungated page", () => {
    expect(canAccessRoute(CONTENT_EDITOR, ROUTE_PATHS.ADMIN_DASHBOARD)).toBe(true);
  });

  it("denies a content editor the pages their role cannot load", () => {
    expect(canAccessRoute(CONTENT_EDITOR, ROUTE_PATHS.ADMIN_MEDIA)).toBe(false);
    expect(canAccessRoute(CONTENT_EDITOR, ROUTE_PATHS.ADMIN_ADMIN_USERS)).toBe(false);
  });

  it("denies a media editor the admin-user list but not the media library", () => {
    expect(canAccessRoute(MEDIA_MANAGER, ROUTE_PATHS.ADMIN_MEDIA)).toBe(true);
    expect(canAccessRoute(MEDIA_MANAGER, ROUTE_PATHS.ADMIN_ADMIN_USERS)).toBe(false);
  });

  it("lets a super admin through both", () => {
    expect(canAccessRoute(SUPER_ADMIN, ROUTE_PATHS.ADMIN_MEDIA)).toBe(true);
    expect(canAccessRoute(SUPER_ADMIN, ROUTE_PATHS.ADMIN_ADMIN_USERS)).toBe(true);
  });

  it("fails closed when no permission list is available", () => {
    const withoutPermissions: Pick<AdminUser, "permissions"> = { permissions: undefined };

    expect(canAccessRoute(withoutPermissions, ROUTE_PATHS.ADMIN_MEDIA)).toBe(false);
    expect(canAccessRoute(null, ROUTE_PATHS.ADMIN_MEDIA)).toBe(false);
    expect(canAccessRoute(undefined, ROUTE_PATHS.ADMIN_MEDIA)).toBe(false);
  });
});

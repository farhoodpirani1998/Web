import { describe, expect, it } from "vitest";

import {
  hasAllPermissions,
  hasAnyPermission,
  hasAnyRole,
  hasPermission,
  hasRole,
} from "./permissions";
import type { AdminPermission, AdminRole, AdminUser } from "@/types/auth";

type PermUser = Pick<AdminUser, "permissions">;
type RoleUser = Pick<AdminUser, "role">;

const editor: PermUser = {
  permissions: ["website.content:read", "website.content:write"],
};

describe("hasPermission", () => {
  it("is true when the permission is present", () => {
    expect(hasPermission(editor, "website.content:read")).toBe(true);
  });

  it("is false when the permission is absent", () => {
    expect(hasPermission(editor, "website.content:publish")).toBe(false);
  });

  // The frontend must fail closed when `/auth/me` didn't carry a
  // permissions list (e.g. the login response shape) rather than
  // guessing from role — see permissions.ts's own doc comment.
  it("fails closed when permissions is missing", () => {
    expect(hasPermission({}, "website.content:read")).toBe(false);
  });

  it("fails closed for a null user", () => {
    expect(hasPermission(null, "website.content:read")).toBe(false);
  });
});

describe("hasAnyPermission / hasAllPermissions", () => {
  it("hasAnyPermission is true when at least one matches", () => {
    expect(
      hasAnyPermission(editor, ["website.media:manage", "website.content:write"]),
    ).toBe(true);
  });

  it("hasAnyPermission is false when none match", () => {
    expect(hasAnyPermission(editor, ["website.media:manage", "website.seo:manage"])).toBe(
      false,
    );
  });

  it("hasAllPermissions is true only when every one matches", () => {
    expect(hasAllPermissions(editor, ["website.content:read", "website.content:write"])).toBe(
      true,
    );
    expect(hasAllPermissions(editor, ["website.content:read", "website.content:publish"])).toBe(
      false,
    );
  });
});

describe("hasRole / hasAnyRole", () => {
  const publisher: RoleUser = { role: "publisher" };

  it("hasRole matches the exact role", () => {
    expect(hasRole(publisher, "publisher")).toBe(true);
    expect(hasRole(publisher, "content_editor")).toBe(false);
  });

  it("hasAnyRole matches one of several", () => {
    const roles: AdminRole[] = ["publisher", "content_editor"];
    expect(hasAnyRole(publisher, roles)).toBe(true);
    expect(hasAnyRole(publisher, ["media_manager"])).toBe(false);
  });

  it("hasAnyRole fails closed for a null user", () => {
    expect(hasAnyRole(null, ["publisher"])).toBe(false);
  });
});

// A compile-time guard: these must accept the exact permission union, not
// arbitrary strings (a typo in a permission string should be a type error).
const _sample: AdminPermission = "website.admins:manage";
void _sample;

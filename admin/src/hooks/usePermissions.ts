import { useMemo } from "react";

import { useAuth } from "@/features/auth";
import type { AdminPermission, AdminRole } from "@/types/auth";
import {
  hasAllPermissions,
  hasAnyPermission,
  hasAnyRole,
  hasPermission,
  hasRole,
} from "@/lib/permissions";

/**
 * Reads the currently authenticated admin (via `useAuth`, see
 * `features/auth/AuthProvider.tsx`) and exposes permission/role checks
 * against it.
 *
 * Deliberately makes no API calls of its own: `useAuth` already holds
 * whatever `/admin/auth/me` last returned, and that's the only source
 * of truth this hook reads from. Nothing here triggers a refetch or
 * re-derives permissions from `role` — see `lib/permissions.ts` for why.
 *
 * Usage:
 *   const { can, hasRole } = usePermissions();
 *   can("website.content:publish")
 *   hasRole("publisher")
 */
export interface UsePermissionsResult {
  /** True if the current user has `permission`. */
  can: (permission: AdminPermission) => boolean;
  /** True if the current user has at least one of `permissions`. */
  canAny: (permissions: AdminPermission[]) => boolean;
  /** True if the current user has every permission in `permissions`. */
  canAll: (permissions: AdminPermission[]) => boolean;
  /** True if the current user's role is exactly `role`. */
  hasRole: (role: AdminRole) => boolean;
  /** True if the current user's role is one of `roles`. */
  hasAnyRole: (roles: AdminRole[]) => boolean;
}

export function usePermissions(): UsePermissionsResult {
  const { admin } = useAuth();

  return useMemo(
    () => ({
      can: (permission) => hasPermission(admin, permission),
      canAny: (permissions) => hasAnyPermission(admin, permissions),
      canAll: (permissions) => hasAllPermissions(admin, permissions),
      hasRole: (role) => hasRole(admin, role),
      hasAnyRole: (roles) => hasAnyRole(admin, roles),
    }),
    [admin],
  );
}

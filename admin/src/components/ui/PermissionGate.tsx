import type { ReactNode } from "react";

import { usePermissions } from "@/hooks/usePermissions";
import type { AdminPermission, AdminRole } from "@/types/auth";

/**
 * Declarative wrapper that shows/hides `children` based on the current
 * admin's permissions/roles, using `usePermissions` under the hood.
 *
 * This is a UI convenience only — it hides controls a user shouldn't
 * see, it is not a security boundary. The backend's own guards
 * (`RequireWebsitePermission`, etc.) are what actually enforce
 * authorization; hiding a button here just avoids showing an action
 * that would fail server-side anyway.
 *
 * At least one of `permission`, `anyOf`, `allOf`, or `role` should be
 * provided. If several are given, all provided conditions must pass
 * (AND semantics) — for "match any of several permissions" use `anyOf`
 * rather than passing multiple props.
 *
 * Usage:
 *   <PermissionGate permission="website.content:publish">
 *     <PublishButton />
 *   </PermissionGate>
 *
 *   <PermissionGate role="publisher" fallback={<ReadOnlyNotice />}>
 *     <PublishButton />
 *   </PermissionGate>
 */
export interface PermissionGateProps {
  children: ReactNode;
  /** Rendered instead of `children` when the check fails. Defaults to nothing. */
  fallback?: ReactNode;
  /** Passes if the current user has this permission. */
  permission?: AdminPermission;
  /** Passes if the current user has at least one of these permissions. */
  anyOf?: AdminPermission[];
  /** Passes if the current user has every one of these permissions. */
  allOf?: AdminPermission[];
  /** Passes if the current user's role is this role. */
  role?: AdminRole;
  /** Passes if the current user's role is one of these roles. */
  anyRole?: AdminRole[];
}

export function PermissionGate({
  children,
  fallback = null,
  permission,
  anyOf,
  allOf,
  role,
  anyRole,
}: PermissionGateProps) {
  const { can, canAny, canAll, hasRole, hasAnyRole } = usePermissions();

  const checks: boolean[] = [];
  if (permission) checks.push(can(permission));
  if (anyOf) checks.push(canAny(anyOf));
  if (allOf) checks.push(canAll(allOf));
  if (role) checks.push(hasRole(role));
  if (anyRole) checks.push(hasAnyRole(anyRole));

  // No condition provided: fail closed rather than always rendering —
  // an empty <PermissionGate> with nothing to check is almost
  // certainly a mistake at the call site, not an intentional "always
  // show this".
  const allowed = checks.length > 0 && checks.every(Boolean);

  return <>{allowed ? children : fallback}</>;
}

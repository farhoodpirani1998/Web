import type { ReactNode } from "react";
import { Navigate, useLocation, type Location } from "react-router-dom";

import { ROUTE_PATHS } from "@/routes/paths";

import { useAuth } from "./AuthProvider";

interface LocationState {
  from?: Location;
}

/**
 * Wraps `/login` (Sprint 2.4B, task 3 — "authenticated users cannot
 * stay on login page unnecessarily"). Redirects an already-authenticated
 * user straight to the admin area, sending them back to wherever
 * `RequireAuth` originally redirected them from, if anywhere.
 */
export function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "checking") {
    return null;
  }

  if (status === "authenticated") {
    const state = location.state as LocationState | null;
    const redirectTo = state?.from?.pathname ?? ROUTE_PATHS.ADMIN_DASHBOARD;
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}

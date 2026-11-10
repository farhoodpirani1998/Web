import type { ReactNode } from "react";
import { Navigate, useLocation, type Location } from "react-router-dom";

import { ROUTE_PATHS } from "@/routes/paths";

import { useAuth } from "./authContext";

interface LocationState {
  from?: Location;
}

/**
 * Redirects authenticated users away from `/login` to the page they
 * originally requested, or to the admin dashboard.
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

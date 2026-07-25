import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { ROUTE_PATHS } from "@/routes/paths";

import { useAuth } from "./AuthProvider";

/**
 * Wraps `/admin/*` (Sprint 2.4B, task 3). Redirects to `/login` when
 * there's no authenticated session, preserving the attempted location
 * in router state so `RedirectIfAuthenticated` can send the user back
 * after they log in.
 *
 * `status === "checking"` is handled defensively but should never
 * actually render here — `AuthProvider` itself blocks rendering its
 * children (which includes the whole router) until bootstrap resolves.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "checking") {
    return null;
  }

  if (status === "unauthenticated") {
    return <Navigate to={ROUTE_PATHS.LOGIN} replace state={{ from: location }} />;
  }

  return <>{children}</>;
}

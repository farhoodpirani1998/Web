import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import type { AdminUser } from "@/types/auth";

import { refreshAccessToken } from "./api";
import {
  clearAuth,
  getAuthState,
  setAccessToken,
  setCurrentAdmin,
  subscribe,
} from "./authStore";

/**
 * - `"checking"` — only true during the one-time startup bootstrap
 *   (see `AuthProvider` below). Never re-entered afterwards, including
 *   during login — the login flow sets the token and admin together,
 *   so status derives straight from `"unauthenticated"` to
 *   `"authenticated"` with no intermediate re-check.
 * - `"authenticated"` — both a token and admin info are present.
 * - `"unauthenticated"` — no valid session.
 */
export type AuthStatus = "checking" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  status: AuthStatus;
  admin: AdminUser | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Runs the authentication bootstrap once on mount, then keeps `status`
 * and `admin` in sync with `authStore` for the lifetime of the app.
 *
 * Bootstrap logic (Sprint — Persistent Login): `authStore`'s access
 * token is still in-memory only and never survives a reload (see its
 * doc comment) — but the refresh-token cookie the backend sets on login
 * does. So on every mount, regardless of whether a token happens to
 * already be in the store, this attempts a silent `POST
 * /admin/auth/refresh`: the browser sends the cookie automatically
 * (`apiClient`'s `withCredentials: true`), and a valid one comes back
 * with both a fresh access token and the admin's identity in one round
 * trip — no separate `/auth/me` call needed, same response shape as
 * `login`. A missing/expired/revoked cookie fails with 401, which is
 * treated as an ordinary "not logged in" outcome, not an error: the
 * user simply lands on `/login` like before this feature existed.
 *
 * Runs exactly once, not on an interval and not before every request —
 * ongoing re-authentication once a session is live is `apiClient`'s
 * job (see its response interceptor), which reacts to an access token
 * actually expiring rather than polling. "Exactly once" means one
 * *effective* run: the `cancelled` guard below ignores the result of
 * any prior invocation once cleanup has run, which is what keeps this
 * correct under React 18 `StrictMode` (used in `main.tsx`) — dev-only,
 * it mounts, cleans up, and re-mounts every component once, so this
 * effect's body genuinely does execute twice in development. The
 * second run's result is what wins; the first's `refreshAccessToken()`
 * call may still complete in the background regardless (fetches can't
 * be cancelled just because the effect was), which is exactly the
 * "two near-simultaneous /refresh calls with the same not-yet-rotated
 * cookie" case `CmsRefreshTokenService.rotate`'s grace window (backend)
 * exists to tolerate without punishing the winner.
 *
 * While bootstrapping, this renders a minimal full-page loading state
 * instead of `children` — this is the one place "authentication
 * checking" needs to be shown, since route guards
 * (`RequireAuth`/`RedirectIfAuthenticated`) only ever run after this
 * resolves.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const authState = useSyncExternalStore(subscribe, getAuthState, getAuthState);
  const [hasBootstrapped, setHasBootstrapped] = useState(false);

  useEffect(() => {
    let cancelled = false;

    refreshAccessToken()
      .then(({ accessToken, admin }) => {
        if (cancelled) return;
        setAccessToken(accessToken);
        setCurrentAdmin(admin);
      })
      .catch(() => {
        if (!cancelled) clearAuth();
      })
      .finally(() => {
        if (!cancelled) setHasBootstrapped(true);
      });

    return () => {
      cancelled = true;
    };
    // Intentionally empty deps: this bootstrap runs exactly once, ever.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const status: AuthStatus = !hasBootstrapped
    ? "checking"
    : authState.accessToken && authState.admin
      ? "authenticated"
      : "unauthenticated";

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Checking authentication…</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ status, admin: authState.admin }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Reads the current auth status/admin. Must be used within `AuthProvider`. */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

/**
 * Public surface of the `auth` feature.
 *
 * Other layers (pages, other features) should import from here rather
 * than reaching into `./authStore`, `./api`, `./AuthProvider`, etc.
 * directly.
 *
 * Sprint 2.4B: adds `AuthProvider`/`useAuth` (bootstrap + reactive auth
 * status) and the `RequireAuth`/`RedirectIfAuthenticated` route guards
 * consumed by `routes/index.tsx`.
 *
 * Sprint — Persistent Login: adds `refreshAccessToken` (silent-login
 * bootstrap, called from `AuthProvider` — `apiClient`'s own 401-retry
 * logic makes an inline call to the same endpoint instead, to avoid a
 * circular import; see `api.ts`'s doc comment) and `logout` (revokes
 * the refresh-token cookie server-side, used by `AdminHeader`'s logout
 * button).
 */
export {
  getAccessToken,
  getCurrentAdmin,
  getAuthState,
  setAccessToken,
  setCurrentAdmin,
  clearAuth,
  subscribe,
} from "./authStore";
export { login, fetchCurrentAdmin, refreshAccessToken, logout } from "./api";
export { AuthProvider, useAuth, type AuthStatus } from "./AuthProvider";
export { RequireAuth } from "./RequireAuth";
export { RedirectIfAuthenticated } from "./RedirectIfAuthenticated";

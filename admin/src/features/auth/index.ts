/**
 * Public surface of the `auth` feature.
 *
 * Other layers (pages, other features) should import from here rather
 * than reaching into `./authStore`, `./api`, `./AuthProvider`, etc.
 * directly.
 *
 * Exposes authentication state, API functions, providers, and route
 * guards to consumers without requiring imports from internal files.
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
export { AuthProvider } from "./AuthProvider";
export { useAuth, type AuthStatus } from "./authContext";
export { RequireAuth } from "./RequireAuth";
export { RequireRouteAccess } from "./RequireRouteAccess";
export { RedirectIfAuthenticated } from "./RedirectIfAuthenticated";

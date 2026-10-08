import type { AdminUser } from "@/types/auth";

/**
 * Minimal auth state for the CMS Admin frontend.
 *
 * Sprint 2.4B: now actively consumed — `apiClient`'s request
 * interceptor reads the token, `apiClient`'s response interceptor
 * clears it on 401, `LoginPage` sets it after a successful login, and
 * `AuthProvider`/`RequireAuth`/`RedirectIfAuthenticated` (see
 * `./AuthProvider.tsx`) derive auth status and route guarding from it.
 *
 * Deliberately a plain module-level store, not Redux/Zustand/Context:
 * the project has no state library dependency yet (see package.json)
 * and the actual need right now is just "hold a token and an admin
 * object in memory, let a couple of places read/write it" — a class or
 * external library would be speculative complexity. `subscribe` lets
 * `AuthProvider` (`./AuthProvider.tsx`) drive React re-renders via
 * `useSyncExternalStore` whenever this store changes.
 *
 * Deliberately in-memory only (no localStorage/sessionStorage): the CMS
 * access token is short-lived by design (see backend `CmsAuthService`,
 * ~15m) and, per this codebase's XSS-defense posture, must never sit
 * somewhere JS-readable across reloads. Persistent login (Sprint —
 * Persistent Login) doesn't change that — it's the httpOnly refresh-
 * token cookie (never touched by this store, or by any JS at all) that
 * survives a reload, not this in-memory access token. `AuthProvider`'s
 * mount-time bootstrap silently exchanges that cookie for a fresh
 * access token via `POST /admin/auth/refresh`, which is what makes a
 * reload no longer require re-entering credentials, without this store
 * ever needing to persist anything itself.
 */

interface AuthState {
  accessToken: string | null;
  admin: AdminUser | null;
}

let state: AuthState = {
  accessToken: null,
  admin: null,
};

type Listener = () => void;
const listeners = new Set<Listener>();

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

/** Current access token, or `null` if not authenticated. */
export function getAccessToken(): string | null {
  return state.accessToken;
}

/** Current authenticated admin info, or `null` if unset. */
export function getCurrentAdmin(): AdminUser | null {
  return state.admin;
}

/** Full snapshot, useful for `useSyncExternalStore`-style consumers. */
export function getAuthState(): AuthState {
  return state;
}

/** Sets the access token (after a successful login, or a successful refresh). */
export function setAccessToken(token: string | null): void {
  state = { ...state, accessToken: token };
  emit();
}

/** Sets the authenticated admin info. */
export function setCurrentAdmin(admin: AdminUser | null): void {
  state = { ...state, admin };
  emit();
}

/** Clears both the token and admin info (logout, or a failed session bootstrap/refresh). */
export function clearAuth(): void {
  state = { accessToken: null, admin: null };
  emit();
}

/** Subscribes to any change in auth state. Returns an unsubscribe function. */
export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

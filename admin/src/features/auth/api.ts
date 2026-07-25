import { apiClient } from "@/lib/apiClient";
import type {
  CurrentAdminResponse,
  LoginCredentials,
  LoginResponse,
} from "@/types/auth";

/**
 * Request functions for the CMS Admin auth endpoints.
 *
 * This is the only file aware of the `/auth/login`, `/auth/me`,
 * `/auth/refresh`, and `/auth/logout` URLs — callers use these
 * functions, never `apiClient` directly (same convention as the public
 * frontend's per-feature `api.ts` files).
 *
 * Sprint 2.4B: `login` is called from `LoginPage`, and `fetchCurrentAdmin`
 * is called from both `LoginPage` (after a successful login) and
 * `AuthProvider` (startup bootstrap check).
 *
 * Sprint — Persistent Login: `refresh` (this file's `refreshAccessToken`)
 * is called from `AuthProvider` (startup silent-login attempt). It is
 * *not* called by `apiClient`'s own response interceptor — that makes
 * its own inline call to the same `/auth/refresh` endpoint instead,
 * since `api.ts` importing `apiClient` and `apiClient.ts` importing
 * back from `api.ts` would be a circular import; the interceptor only
 * needs the access token out of the response anyway, not the full
 * `LoginResponse` shape this function returns. `logout` is called from
 * `AdminHeader`'s logout button. Neither function ever handles a
 * refresh token directly — it travels only as the httpOnly cookie the
 * backend sets/reads on these same three routes (`login`, `refresh`,
 * `logout`), which is exactly why `apiClient` must be configured with
 * `withCredentials: true` (see `lib/apiClient.ts`) for any of this to
 * work cross-origin.
 */

export async function login(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>(
    "/auth/login",
    credentials,
  );
  return response.data;
}

export async function fetchCurrentAdmin(): Promise<CurrentAdminResponse> {
  const response = await apiClient.get<CurrentAdminResponse>("/auth/me");
  return response.data;
}

/**
 * Exchanges the refresh-token cookie for a new access token. Rejects
 * (a 401 normalized to `ApiError`) if there's no valid cookie — callers
 * treat that as "not logged in", not as an unexpected failure.
 */
export async function refreshAccessToken(): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>("/auth/refresh");
  return response.data;
}

/**
 * Revokes the current refresh token server-side and clears its cookie.
 * Callers should clear local auth state (`clearAuth()`) regardless of
 * whether this succeeds — a network failure here shouldn't be able to
 * strand the user in a "still looks logged in" state on their own
 * device.
 */
export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
}

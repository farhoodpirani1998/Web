import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

import { clearAuth, getAccessToken, setAccessToken } from "@/features/auth/authStore";

import { env } from "./env";
import { normalizeApiError } from "./apiError";

/**
 * The single, exclusive HTTP client for the CMS Admin API.
 *
 * Rules enforced here:
 * - Base URL points only at the CMS admin API (`env.adminApiBaseUrl`) —
 *   this codebase has no code path capable of reaching the SMS/public
 *   API, and must not gain one (see Sprint 2.4A architecture context).
 * - Every request that has a token attaches it as a Bearer token.
 * - Every error is normalized into an `ApiError` before it leaves this
 *   module, so calling code never parses raw HTTP responses.
 *
 * Sprint — Persistent Login: `withCredentials: true` so the browser
 * sends/stores the backend's httpOnly refresh-token cookie on every
 * request to this API, including cross-origin ones (the admin SPA and
 * this API are typically different origins in dev/prod alike) — see
 * `main.ts`'s CORS config on the backend, which this depends on.
 *
 * A 401 no longer clears auth unconditionally the way it did in Sprint
 * 2.4B: it now means "the access token needs refreshing", not
 * necessarily "the session is over" — see `shouldRetryAfterRefresh`
 * below. Auth state is only cleared once a refresh attempt itself fails.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: env.adminApiBaseUrl,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }

  return config;
});

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  /** Marks a request that already went through one refresh-and-retry cycle, so it's never attempted twice. */
  _retriedAfterRefresh?: boolean;
}

/**
 * Routes that must never trigger a refresh-and-retry themselves: `login`
 * failing with 401 is just "wrong credentials", `refresh` failing with
 * 401 is the definitive "no valid session left" signal (retrying it
 * would recurse), and `logout` failing doesn't need a retry — the
 * caller clears local state regardless (see `api.ts`'s `logout` doc
 * comment).
 */
const AUTH_ROUTES_WITHOUT_RETRY = new Set(["/auth/login", "/auth/refresh", "/auth/logout"]);

/**
 * De-duplicates concurrent refresh attempts: if several requests fail
 * with 401 around the same time (e.g. a page firing off a handful of
 * parallel loads right as the access token expires), they all await
 * this same in-flight call instead of each racing the backend to
 * rotate the one refresh-token cookie — a second, redundant `/refresh`
 * would otherwise find the first one's rotation had already moved the
 * cookie out from under it.
 */
let refreshPromise: Promise<string> | null = null;

function refreshAccessTokenOnce(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = apiClient
      .post<{ accessToken: string }>("/auth/refresh")
      .then((response) => {
        const { accessToken } = response.data;
        setAccessToken(accessToken);
        return accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config as RetryableRequestConfig | undefined;
    const status = error.response?.status;

    const shouldRetryAfterRefresh =
      status === 401 &&
      config &&
      !config._retriedAfterRefresh &&
      !AUTH_ROUTES_WITHOUT_RETRY.has(config.url ?? "");

    if (shouldRetryAfterRefresh) {
      config._retriedAfterRefresh = true;

      let newAccessToken: string;
      try {
        newAccessToken = await refreshAccessTokenOnce();
      } catch {
        // The refresh call's own failure already went through this same
        // interceptor (its url is in AUTH_ROUTES_WITHOUT_RETRY, so it
        // didn't recurse) and cleared auth via the branch below — this
        // catch just lets the *original* request's caller see a
        // rejection too, instead of hanging.
        return Promise.reject(normalizeApiError(error));
      }

      // Deliberately outside the try/catch above: if the retried request
      // itself fails (for any reason, including a fresh 401), that
      // rejection should propagate with its own accurate error, not be
      // swallowed and replaced with the original 401. A fresh 401 here
      // would recurse back through this very interceptor, but
      // `_retriedAfterRefresh` is already set on `config`, so
      // `shouldRetryAfterRefresh` evaluates false on that pass and it
      // falls through to the generic handling below instead of looping.
      config.headers.set("Authorization", `Bearer ${newAccessToken}`);
      return apiClient.request(config);
    }

    const apiError = normalizeApiError(error);

    if (apiError.kind === "unauthorized") {
      clearAuth();
    }

    return Promise.reject(apiError);
  },
);

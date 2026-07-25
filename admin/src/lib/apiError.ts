import type { AxiosError } from "axios";

/**
 * A small, consistent set of frontend error kinds so pages/features never
 * need to interpret raw HTTP status codes themselves — the API layer is
 * the only place this mapping happens. Mirrors the public frontend's
 * `shared/api/apiError.ts` (kept as a separate copy, not a shared import:
 * the admin and public apps are independent frontends with no shared
 * runtime code path between them).
 *
 * `"unauthorized"` is its own kind (rather than folding into `"unknown"`)
 * because `apiClient`'s response interceptor uses it to clear auth
 * state on any 401, and `RequireAuth`/`RedirectIfAuthenticated`
 * (Sprint 2.4B) redirect based on the resulting auth state — not on
 * this kind directly.
 */
export type ApiErrorKind =
  | "network"
  | "unauthorized"
  | "not-found"
  | "server"
  | "unknown";

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;

  constructor(kind: ApiErrorKind, message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
  }
}

/**
 * Extracts a safe, human-readable message from a NestJS error response
 * body (`{ message: string | string[] }`), if present. This is the ONLY
 * backend-authored text this module will ever surface — NestJS's own
 * exception filters already curate these into safe, generic strings
 * (e.g. "Invalid email or password", "This admin account has been
 * disabled"). Nothing else from the response (stack traces, raw axios
 * messages like "Request failed with status code 500") is ever shown.
 */
function extractBackendMessage(axiosError: AxiosError): string | undefined {
  const data = axiosError.response?.data;

  if (!data || typeof data !== "object" || !("message" in data)) {
    return undefined;
  }

  const message = (data as { message?: unknown }).message;

  if (typeof message === "string") {
    return message;
  }

  if (Array.isArray(message) && message.every((item) => typeof item === "string")) {
    return message.join(" ");
  }

  return undefined;
}

/**
 * Normalizes any error thrown by the admin API client into an `ApiError`
 * with one of the recognized kinds. Called exclusively from `apiClient`'s
 * response interceptor — no other layer should need to import this.
 */
export function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  const axiosError = error as AxiosError;

  if (axiosError?.isAxiosError) {
    if (!axiosError.response) {
      return new ApiError("network", "Unable to reach the server.");
    }

    const status = axiosError.response.status;

    if (status === 401) {
      // Deliberately a fixed, generic message rather than
      // `extractBackendMessage` here — same reasoning as the backend's
      // own `CmsAuthService.login`: "wrong password" and "no such
      // email" must look identical to the caller, so this can't be
      // more specific even if the backend's body happened to be.
      return new ApiError("unauthorized", "Invalid email or password.", status);
    }

    if (status === 404) {
      return new ApiError("not-found", "The requested resource was not found.", status);
    }

    if (status >= 500) {
      return new ApiError("server", "The server encountered an error.", status);
    }

    // Other 4xx (e.g. 403 for a disabled admin account): the backend's
    // own message is already a curated, safe string — see
    // `extractBackendMessage`'s doc comment — so prefer it over a
    // generic fallback when present.
    return new ApiError(
      "unknown",
      extractBackendMessage(axiosError) ?? "Something went wrong. Please try again.",
      status,
    );
  }

  return new ApiError("unknown", "An unexpected error occurred.");
}

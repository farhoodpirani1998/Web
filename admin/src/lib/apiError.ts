import type { AxiosError } from "axios";
import type { FieldPath, FieldValues, UseFormSetError } from "react-hook-form";

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
 * redirect based on the resulting auth state — not on
 * this kind directly.
 */
export type ApiErrorKind =
  "network" | "unauthorized" | "not-found" | "server" | "unknown";

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status?: number;
  readonly fieldErrors?: Record<string, string>;

  constructor(
    kind: ApiErrorKind,
    message: string,
    status?: number,
    fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
    this.fieldErrors = fieldErrors;
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

function extractFieldErrors(axiosError: AxiosError): Record<string, string> | undefined {
  const data = axiosError.response?.data;
  if (!data || typeof data !== "object" || !("message" in data)) return undefined;

  const messages = (data as { message?: unknown }).message;
  if (!Array.isArray(messages)) return undefined;

  const fieldErrors: Record<string, string> = {};
  for (const message of messages) {
    if (typeof message !== "string") continue;
    const match = /^([a-z][A-Za-z0-9]*(?:\.[A-Za-z0-9_-]+)*)\s+(.+)$/.exec(message);
    const nestedMatch = /\bin\s+([a-z][A-Za-z0-9]*(?:\.[A-Za-z0-9_-]+)*)\s+/.exec(
      message,
    );
    const property = nestedMatch?.[1] ?? match?.[1];
    if (!property) continue;
    const detail = nestedMatch ? message : (match?.[2] ?? message);
    fieldErrors[property] = fieldErrors[property]
      ? `${fieldErrors[property]} ${detail}`
      : detail;
  }
  return Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined;
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
      return new ApiError(
        "network",
        "ارتباط با سرور برقرار نشد. اتصال اینترنت خود را بررسی کنید.",
      );
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
      return new ApiError("not-found", "مورد درخواستی پیدا نشد.", status);
    }

    if (status === 429) {
      return new ApiError(
        "unknown",
        "درخواست‌های زیادی ارسال شده است. لطفاً کمی بعد دوباره تلاش کنید.",
        status,
      );
    }

    if (status >= 500) {
      return new ApiError(
        "server",
        "خطایی در سرور رخ داد. لطفاً دوباره تلاش کنید.",
        status,
      );
    }

    if (status === 400) {
      return new ApiError(
        "unknown",
        "لطفاً اطلاعات واردشده را بررسی کنید.",
        status,
        extractFieldErrors(axiosError),
      );
    }

    // Other 4xx (e.g. 403 for a disabled admin account): the backend's
    // own message is already a curated, safe string — see
    // `extractBackendMessage`'s doc comment — so prefer it over a
    // generic fallback when present.
    return new ApiError(
      "unknown",
      extractBackendMessage(axiosError) ?? "مشکلی پیش آمد. لطفاً دوباره تلاش کنید.",
      status,
    );
  }

  return new ApiError("unknown", "An unexpected error occurred.");
}

export function applyApiFieldErrors<TFieldValues extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<TFieldValues>,
  fields: readonly FieldPath<TFieldValues>[],
): boolean {
  if (!(error instanceof ApiError) || !error.fieldErrors) return false;

  let applied = false;
  for (const [name, message] of Object.entries(error.fieldErrors)) {
    const rootName = name.split(".")[0];
    const field = fields.find(
      (candidate) => candidate === name || candidate === rootName,
    );
    if (!field) continue;
    setError(field, { type: "server", message });
    applied = true;
  }
  return applied;
}

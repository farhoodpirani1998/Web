import type { AxiosError } from "axios";

/**
 * A small, consistent set of frontend error types (§14, §18) so that
 * sections and pages never need to interpret raw HTTP status codes
 * themselves. The API layer is the only place this mapping happens.
 */
export type ApiErrorKind = "network" | "not-found" | "server" | "unknown";

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
 * Normalizes any error thrown by the API client into an `ApiError` with
 * one of the recognized kinds. Called exclusively from the API layer
 * (`src/shared/api`) — no other layer should need to import this.
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

    if (status === 404) {
      return new ApiError("not-found", "The requested resource was not found.", status);
    }

    if (status >= 500) {
      return new ApiError("server", "The server encountered an error.", status);
    }

    return new ApiError("unknown", axiosError.message, status);
  }

  return new ApiError("unknown", "An unexpected error occurred.");
}

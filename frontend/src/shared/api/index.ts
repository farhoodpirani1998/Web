/**
 * Public surface of the shared API layer.
 *
 * Per §14, this is the only layer aware of the Public API's HTTP
 * contract. Feature-level query functions (added alongside each
 * feature in later phases) import `apiClient` from here — they should
 * never construct their own axios/fetch instance.
 */
export { apiClient } from "./client";
export { queryClient } from "./queryClient";
export { ApiError, normalizeApiError } from "./apiError";
export type { ApiErrorKind } from "./apiError";

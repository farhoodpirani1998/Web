import axios, { type AxiosInstance } from "axios";

import { env } from "@/shared/config/env";

import { normalizeApiError } from "./apiError";

/**
 * The single, exclusive HTTP client for the Website Public API
 * (Website Frontend Architecture §14 "API Layer Design").
 *
 * Rules enforced here:
 * - Base URL points only at the Public API — this codebase has no
 *   code path capable of reaching the admin API (§14, §30).
 * - Every error is normalized into an `ApiError` before it leaves this
 *   module, so calling code never parses raw HTTP responses.
 *
 * Typed request functions live alongside their corresponding features;
 * this module only provides the shared client and error normalization.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: env.publicApiBaseUrl,
  timeout: env.apiTimeoutMs,
  headers: {
    Accept: "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(normalizeApiError(error)),
);

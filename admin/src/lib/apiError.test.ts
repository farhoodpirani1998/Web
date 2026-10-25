import { describe, expect, it } from "vitest";

import { ApiError, normalizeApiError } from "./apiError";

/** Builds the shape `isAxiosError`-branded errors carry. */
function axiosError(status?: number, data?: unknown) {
  return {
    isAxiosError: true,
    response: status === undefined ? undefined : { status, data },
  };
}

describe("normalizeApiError", () => {
  it("passes an existing ApiError through unchanged", () => {
    const original = new ApiError("server", "boom", 500);
    expect(normalizeApiError(original)).toBe(original);
  });

  it("maps a response-less axios error to `network`", () => {
    const result = normalizeApiError(axiosError());
    expect(result.kind).toBe("network");
  });

  it("maps 401 to `unauthorized` with a generic message", () => {
    const result = normalizeApiError(axiosError(401, { message: "nope" }));
    expect(result.kind).toBe("unauthorized");
    expect(result.status).toBe(401);
    // Deliberately generic — must not echo the backend body for auth.
    expect(result.message).toBe("Invalid email or password.");
  });

  it("maps 404 to `not-found`", () => {
    expect(normalizeApiError(axiosError(404)).kind).toBe("not-found");
  });

  it("maps 5xx to `server`", () => {
    expect(normalizeApiError(axiosError(503)).kind).toBe("server");
  });

  it("prefers the backend's curated message for other 4xx", () => {
    const result = normalizeApiError(axiosError(403, { message: "Account disabled" }));
    expect(result.kind).toBe("unknown");
    expect(result.message).toBe("Account disabled");
    expect(result.status).toBe(403);
  });

  it("joins an array of backend messages", () => {
    const result = normalizeApiError(axiosError(400, { message: ["a", "b"] }));
    expect(result.message).toBe("a b");
  });

  it("falls back for a 4xx with no usable body", () => {
    const result = normalizeApiError(axiosError(400, {}));
    expect(result.kind).toBe("unknown");
    expect(result.message).toBe("Something went wrong. Please try again.");
  });

  it("maps a non-axios error to `unknown`", () => {
    expect(normalizeApiError(new Error("plain")).kind).toBe("unknown");
  });
});

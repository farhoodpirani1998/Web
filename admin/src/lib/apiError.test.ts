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

  it("maps class-validator messages to form field errors", () => {
    const result = normalizeApiError(
      axiosError(400, {
        message: [
          "studentNationalId must match the required format",
          "guardianPhone must be valid",
          "each value in contactPhones must be a string",
          "address.fa should not be empty",
        ],
      }),
    );
    expect(result.message).toBe("لطفاً اطلاعات واردشده را بررسی کنید.");
    expect(result.fieldErrors).toEqual({
      studentNationalId: "must match the required format",
      guardianPhone: "must be valid",
      contactPhones: "each value in contactPhones must be a string",
      "address.fa": "should not be empty",
    });
  });

  it("shows a Persian rate-limit message", () => {
    expect(normalizeApiError(axiosError(429)).message).toContain("درخواست‌های زیادی");
  });

  it("shows a Persian server message", () => {
    expect(normalizeApiError(axiosError(500)).message).toContain("خطایی در سرور");
  });

  it("falls back for a 4xx with no usable body", () => {
    const result = normalizeApiError(axiosError(400, {}));
    expect(result.kind).toBe("unknown");
    expect(result.message).toBe("لطفاً اطلاعات واردشده را بررسی کنید.");
  });

  it("maps a non-axios error to `unknown`", () => {
    expect(normalizeApiError(new Error("plain")).kind).toBe("unknown");
  });
});

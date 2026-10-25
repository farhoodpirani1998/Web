import { describe, expect, it } from "vitest";

import { formatPersianDate, formatPersianTime } from "./formatDate";

describe("formatPersianDate", () => {
  it("renders a Jalali (Persian-calendar) date in Persian digits", () => {
    // Shape/timezone-independent: Persian digits with two slashes.
    expect(formatPersianDate("2026-10-13T00:00:00Z")).toMatch(/^[۰-۹]{4}\/[۰-۹]{2}\/[۰-۹]{2}$/);
  });

  it("accepts a Date instance", () => {
    expect(formatPersianDate(new Date("2026-10-13T00:00:00Z"))).toMatch(/[۰-۹]/);
  });

  it("returns empty string for missing/unparsable input", () => {
    expect(formatPersianDate(null)).toBe("");
    expect(formatPersianDate(undefined)).toBe("");
    expect(formatPersianDate("not-a-date")).toBe("");
  });
});

describe("formatPersianTime", () => {
  it("renders an HH:mm clock in Persian digits (24-hour cycle)", () => {
    expect(formatPersianTime("2026-10-13T09:05:00Z")).toMatch(/^[۰-۹]{2}:[۰-۹]{2}$/);
  });

  it("returns empty string for missing/unparsable input", () => {
    expect(formatPersianTime(null)).toBe("");
    expect(formatPersianTime("nope")).toBe("");
  });
});

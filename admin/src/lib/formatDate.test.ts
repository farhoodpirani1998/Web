import { afterEach, describe, expect, it, vi } from "vitest";

import { formatDateTime, formatLongDate, formatRelativeTime } from "./formatDate";

afterEach(() => {
  vi.useRealTimers();
});

describe("formatRelativeTime", () => {
  it("returns «چند لحظه پیش» for under a minute", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-13T12:00:00Z"));
    expect(formatRelativeTime("2026-10-13T11:59:30Z")).toBe("چند لحظه پیش");
  });

  it("counts minutes, hours, then days", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-13T12:00:00Z"));
    expect(formatRelativeTime("2026-10-13T11:45:00Z")).toBe("۱۵ دقیقه پیش");
    expect(formatRelativeTime("2026-10-13T09:00:00Z")).toBe("۳ ساعت پیش");
    expect(formatRelativeTime("2026-10-11T12:00:00Z")).toBe("۲ روز پیش");
  });

  it("falls back to a plain date beyond a week", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-13T12:00:00Z"));
    const result = formatRelativeTime("2026-09-01T12:00:00Z");
    expect(result).not.toContain("پیش");
    expect(result).not.toHaveLength(0);
  });

  it("returns empty string for an unparsable value", () => {
    expect(formatRelativeTime("not-a-date")).toBe("");
  });
});

describe("formatLongDate", () => {
  it("renders a non-empty Persian date", () => {
    const result = formatLongDate(new Date("2026-10-13T12:00:00Z"));
    // Persian (fa-IR) numerals — asserts the locale is actually applied.
    expect(result).toMatch(/[۰-۹]/);
  });
});

describe("formatDateTime", () => {
  it("joins date and time with the Persian separator", () => {
    const result = formatDateTime("2026-10-13T09:30:00Z");
    expect(result).toContain("،");
    expect(result).toMatch(/[۰-۹]/);
  });

  it("returns empty string for an unparsable value", () => {
    expect(formatDateTime("nope")).toBe("");
  });
});

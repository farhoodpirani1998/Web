import { describe, expect, it } from "vitest";

import { formatNumber } from "./formatNumber";

describe("formatNumber", () => {
  it("formats integers with Persian numerals and grouping", () => {
    expect(formatNumber(12345)).toBe("۱۲٬۳۴۵");
  });
});

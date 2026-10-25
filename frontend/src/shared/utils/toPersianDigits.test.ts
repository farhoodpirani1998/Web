import { describe, expect, it } from "vitest";

import { toPersianDigits } from "./toPersianDigits";

describe("toPersianDigits", () => {
  it("converts every Western digit to its Persian counterpart", () => {
    expect(toPersianDigits(1234567890)).toBe("۱۲۳۴۵۶۷۸۹۰");
  });

  it("leaves non-digit characters untouched", () => {
    expect(toPersianDigits("a1b2")).toBe("a۱b۲");
  });

  it("handles a string input the same as a number", () => {
    expect(toPersianDigits("1404")).toBe("۱۴۰۴");
  });

  it("is a no-op on a string with no Western digits", () => {
    expect(toPersianDigits("سلام")).toBe("سلام");
  });
});

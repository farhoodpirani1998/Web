import { describe, expect, it } from "vitest";

import { toEnglishDigits, toPersianDigits } from "./toPersianDigits";

describe("digit localization helpers", () => {
  it("normalizes Western and Arabic-Indic digits to Persian for display", () => {
    expect(toPersianDigits("0263-٠٥")).toBe("۰۲۶۳-۰۵");
  });

  it("normalizes Persian and Arabic-Indic digits to Western digits for storage", () => {
    expect(toEnglishDigits("۰۲۶۳-٠٥")).toBe("0263-05");
  });
});

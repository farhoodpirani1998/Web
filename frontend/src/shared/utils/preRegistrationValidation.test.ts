import { describe, expect, it } from "vitest";

import {
  isValidNationalId,
  isValidBirthDate,
  getTodayDateString,
  normalizeDigits,
  normalizeIranPhone,
} from "./preRegistrationValidation";

describe("pre-registration validation", () => {
  it("normalizes Persian and Arabic-Indic digits", () => {
    expect(normalizeDigits("۰۱۲۳۴۵۶۷۸۹")).toBe("0123456789");
    expect(normalizeDigits("٠١٢٣٤٥٦٧٨٩")).toBe("0123456789");
  });

  it("checks national-id length and checksum", () => {
    expect(isValidNationalId("1234567891")).toBe(true);
    expect(isValidNationalId("۱۲۳۴۵۶۷۸۹۱")).toBe(true);
    expect(isValidNationalId("12345x7891")).toBe(false);
    expect(isValidNationalId("1234567890")).toBe(false);
    expect(isValidNationalId("1111111111")).toBe(false);
  });

  it("normalizes Iranian phone formats to 11-digit local form", () => {
    expect(normalizeIranPhone("۰۹۱۲۱۲۳۴۵۶۷")).toBe("09121234567");
    expect(normalizeIranPhone("+989121234567")).toBe("09121234567");
    expect(normalizeIranPhone("00989121234567")).toBe("09121234567");
    expect(normalizeIranPhone("123")).toBeNull();
    expect(normalizeIranPhone("0912abc4567")).toBeNull();
  });

  it("accepts valid past birth dates and rejects invalid or future dates", () => {
    expect(isValidBirthDate("2015-01-01", "2026-11-08")).toBe(true);
    expect(isValidBirthDate("2026-11-09", "2026-11-08")).toBe(false);
    expect(isValidBirthDate("2023-02-29", "2026-11-08")).toBe(false);
    expect(isValidBirthDate("not-a-date", "2026-11-08")).toBe(false);
    expect(getTodayDateString()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

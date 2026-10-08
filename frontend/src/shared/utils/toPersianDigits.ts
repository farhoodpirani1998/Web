const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

/**
 * Converts a number's Western-Arabic digits to Persian digits for
 * display (Website Frontend Architecture §28 "Locale-driven direction").
 * Static Persian-numeral copy is written directly as literal strings
 * elsewhere in the app (e.g. `StatisticsGrid`); this utility is for the
 * one case that differs — a number computed at runtime (e.g. a
 * count-up animation's current value) that still needs to render in
 * Persian numerals.
 */
export function toPersianDigits(value: number | string): string {
  return String(value).replace(/[0-9]/g, (digit) => PERSIAN_DIGITS[Number(digit)]);
}

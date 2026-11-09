const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const ASCII_DIGITS = "0123456789";

/**
 * Converts Western-Arabic digits in a number/string to Persian digits for
 * display. Mirrors the public frontend's `shared/utils/toPersianDigits.ts`
 * — the admin UI is Persian throughout, so any runtime-computed number
 * shown to an admin (counts, relative-time offsets) should render in
 * Persian numerals too, not just the static copy that's already typed in
 * Persian.
 */
export function toPersianDigits(value: number | string): string {
  return String(value).replace(/[0-9٠-٩]/g, (digit) => {
    const asciiDigit = ARABIC_DIGITS.includes(digit)
      ? String(ARABIC_DIGITS.indexOf(digit))
      : digit;
    return PERSIAN_DIGITS[Number(asciiDigit)];
  });
}

export function toEnglishDigits(value: string): string {
  return value.replace(/[۰-۹٠-٩]/g, (digit) => {
    const digitIndex =
      digit >= "۰" && digit <= "۹"
        ? digit.charCodeAt(0) - "۰".charCodeAt(0)
        : ARABIC_DIGITS.indexOf(digit);
    return ASCII_DIGITS[digitIndex];
  });
}

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

/**
 * Converts Western-Arabic digits in a number/string to Persian digits for
 * display. Mirrors the public frontend's `shared/utils/toPersianDigits.ts`
 * — the admin UI is Persian throughout, so any runtime-computed number
 * shown to an admin (counts, relative-time offsets) should render in
 * Persian numerals too, not just the static copy that's already typed in
 * Persian.
 */
export function toPersianDigits(value: number | string): string {
  return String(value).replace(/[0-9]/g, (digit) => PERSIAN_DIGITS[Number(digit)]);
}

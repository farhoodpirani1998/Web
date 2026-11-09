/**
 * Mirrored from `frontend/src/shared/utils/preRegistrationValidation.ts`.
 * Keep its behavior and tests synchronized with the public form.
 */
export function normalizeDigits(value: string): string {
  return value.replace(/[۰-۹٠-٩]/g, (digit) => {
    const code = digit.charCodeAt(0);
    return String(code >= 0x06f0 ? code - 0x06f0 : code - 0x0660);
  });
}

export function isValidNationalId(value: string): boolean {
  const normalized = normalizeDigits(value).trim();
  if (!/^[\d\s-]+$/.test(normalized)) return false;
  const digits = normalized.replace(/[\s-]/g, "");
  if (!/^\d{10}$/.test(digits) || /^(\d)\1{9}$/.test(digits)) return false;

  const checksum = Number(digits[9]);
  const sum = digits
    .slice(0, 9)
    .split("")
    .reduce((total, digit, index) => total + Number(digit) * (10 - index), 0);
  const remainder = sum % 11;
  return checksum === (remainder < 2 ? remainder : 11 - remainder);
}

export function normalizeIranPhone(value: string): string | null {
  let digits = normalizeDigits(value).trim();
  if (!/^[\d+()\s-]+$/.test(digits)) return null;
  digits = digits.replace(/[()\s-]/g, "");

  if (digits.startsWith("+98")) digits = `0${digits.slice(3)}`;
  else if (digits.startsWith("0098")) digits = `0${digits.slice(4)}`;
  else if (digits.startsWith("98")) digits = `0${digits.slice(2)}`;

  if (digits.includes("+")) return null;
  return /^0\d{10}$/.test(digits) && !/^(\d)\1{10}$/.test(digits) ? digits : null;
}

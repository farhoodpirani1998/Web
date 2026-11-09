export function normalizeLegacyDigits(value: string): string {
  return value.replace(/[۰-۹٠-٩]/g, (digit) => {
    const code = digit.charCodeAt(0);
    return String(code >= 0x06f0 ? code - 0x06f0 : code - 0x0660);
  });
}

export function isValidLegacyContactData(
  nationalId: string,
  phone: string,
): boolean {
  return /^\d{10}$/.test(nationalId) && /^0\d{10}$/.test(phone);
}

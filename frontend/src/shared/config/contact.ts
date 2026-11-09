export function getContactPhones(
  contactPhones?: readonly string[],
  legacyContactPhone?: string,
): readonly string[] {
  if (contactPhones?.length) return contactPhones;
  return legacyContactPhone ? [legacyContactPhone] : [];
}

export function toTelephoneHref(phone: string): string {
  const localizedDigits = "۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩";
  const asciiDigits = "01234567890123456789";
  const normalized = phone
    .replace(/[۰-۹٠-٩]/g, (digit) => asciiDigits[localizedDigits.indexOf(digit)])
    .replace(/[^\d+]/g, "");
  return `tel:${normalized}`;
}

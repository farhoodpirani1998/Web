const ARABIC_DIGIT_START = '٠'.charCodeAt(0);
const PERSIAN_DIGIT_START = '۰'.charCodeAt(0);

export function normalizePersianText(value: string): string {
  return value
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[٠-٩۰-۹]/g, (digit) => {
      const codePoint = digit.charCodeAt(0);
      const offset =
        codePoint >= PERSIAN_DIGIT_START
          ? codePoint - PERSIAN_DIGIT_START
          : codePoint - ARABIC_DIGIT_START;
      return String(offset);
    })
    .trim();
}

export function getUnimportedTextbookSeeds<T extends { code: string }>(
  seeds: readonly T[],
  existingCodes: ReadonlySet<string>,
): T[] {
  const seenCodes = new Set(existingCodes);
  return seeds.filter((seed) => {
    if (seenCodes.has(seed.code)) return false;
    seenCodes.add(seed.code);
    return true;
  });
}

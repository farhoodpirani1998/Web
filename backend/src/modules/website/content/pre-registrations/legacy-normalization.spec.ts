import {
  isValidLegacyContactData,
  normalizeLegacyDigits,
} from './legacy-normalization';

describe('legacy pre-registration normalization', () => {
  it('converts Persian and Arabic-Indic digits to ASCII', () => {
    expect(normalizeLegacyDigits('۰۱۲۳۴۵۶۷۸۹')).toBe('0123456789');
    expect(normalizeLegacyDigits('٠١٢٣٤٥٦٧٨٩')).toBe('0123456789');
  });

  it('reports contact rows that do not match the API formats', () => {
    expect(isValidLegacyContactData('1234567890', '09121234567')).toBe(true);
    expect(isValidLegacyContactData('123', '09121234567')).toBe(false);
    expect(isValidLegacyContactData('1234567890', '9121234567')).toBe(false);
  });
});

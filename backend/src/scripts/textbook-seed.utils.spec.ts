import {
  getUnimportedTextbookSeeds,
  normalizePersianText,
} from './textbook-seed.utils';

describe('textbook seed utilities', () => {
  it('normalizes Persian letters, Arabic and Persian numerals, and outer whitespace', () => {
    expect(normalizePersianText('  كتاب ي ۱۲٣\t')).toBe('کتاب ی 123');
  });

  it('imports only codes not already present and ignores duplicate seed codes', () => {
    const seeds = [{ code: 'BOOK-1' }, { code: 'BOOK-2' }, { code: 'BOOK-2' }];

    expect(getUnimportedTextbookSeeds(seeds, new Set(['BOOK-1']))).toEqual([
      { code: 'BOOK-2' },
    ]);
    expect(
      getUnimportedTextbookSeeds(seeds, new Set(['BOOK-1', 'BOOK-2'])),
    ).toEqual([]);
  });
});

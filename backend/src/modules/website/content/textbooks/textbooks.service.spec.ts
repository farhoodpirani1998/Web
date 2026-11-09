import { TextbookSourceType } from './entities/textbook.entity';
import { TextbooksService } from './textbooks.service';

describe('TextbooksService', () => {
  let service: TextbooksService;
  let storage: { remove: jest.Mock; save: jest.Mock; open: jest.Mock };
  let textbooksRepo: any;
  let siteService: any;

  beforeEach(() => {
    storage = {
      save: jest.fn(),
      remove: jest.fn().mockResolvedValue(undefined),
      open: jest.fn(),
    };
    textbooksRepo = {
      create: jest.fn((input) => input),
      save: jest.fn(async (input) => input),
      findOne: jest.fn(),
      increment: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    siteService = { getDefaultSiteId: jest.fn(() => 'site-1') };

    service = new TextbooksService(
      textbooksRepo as any,
      { createQueryBuilder: jest.fn() } as any,
      { create: jest.fn(), save: jest.fn() } as any,
      { create: jest.fn(), save: jest.fn() } as any,
      siteService as any,
      storage as any,
    );
  });

  it('removes the uploaded PDF from storage when a textbook is deleted', async () => {
    const book = {
      id: 'book-1',
      siteId: 'site-1',
      fileKey: 'old-file.pdf',
      fileSize: '123',
      checksum: 'abc',
      deletedAt: null,
      sourceType: TextbookSourceType.UPLOADED,
    };
    textbooksRepo.findOne.mockResolvedValue(book);

    await service.remove('book-1');

    expect(storage.remove).toHaveBeenCalledWith('old-file.pdf');
    expect(book.fileKey).toBeNull();
    expect(book.fileSize).toBe('0');
    expect(book.checksum).toBeNull();
    expect(book.deletedAt).toBeInstanceOf(Date);
    expect(textbooksRepo.save).toHaveBeenCalledWith(book);
  });

  it('removes the stored PDF when a textbook switches away from uploaded source', async () => {
    const book = {
      id: 'book-1',
      siteId: 'site-1',
      sourceType: TextbookSourceType.UPLOADED,
      fileKey: 'old-file.pdf',
      fileSize: '123',
      checksum: 'abc',
      externalUrl: null,
    };
    textbooksRepo.findOne.mockResolvedValue(book);

    await service.update('book-1', {
      sourceType: TextbookSourceType.EXTERNAL_LINK,
      externalUrl: 'https://example.com/book.pdf',
    });

    expect(storage.remove).toHaveBeenCalledWith('old-file.pdf');
    expect(book.fileKey).toBeNull();
    expect(book.fileSize).toBe('0');
    expect(book.checksum).toBeNull();
    expect(book.sourceType).toBe(TextbookSourceType.EXTERNAL_LINK);
    expect(textbooksRepo.save).toHaveBeenCalledWith(book);
  });
});

import { TextbookSourceType } from './entities/textbook.entity';
import { TextbooksService } from './textbooks.service';

describe('TextbooksService', () => {
  let service: TextbooksService;
  let storage: { remove: jest.Mock; save: jest.Mock; open: jest.Mock };
  let textbooksRepo: any;
  let downloadLogsRepo: any;
  let siteService: any;
  let fileCleanup: {
    enqueue: jest.Mock;
    enqueueForRetry: jest.Mock;
    processPending: jest.Mock;
  };

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
    textbooksRepo.manager = {
      transaction: jest.fn(async (callback) =>
        callback({ getRepository: jest.fn(() => textbooksRepo) }),
      ),
    };
    downloadLogsRepo = { create: jest.fn((input) => input), save: jest.fn() };
    siteService = { getDefaultSiteId: jest.fn(() => 'site-1') };
    fileCleanup = {
      enqueue: jest.fn(async () => undefined),
      enqueueForRetry: jest.fn(async () => undefined),
      processPending: jest.fn(async () => undefined),
    };

    service = new TextbooksService(
      textbooksRepo as any,
      { createQueryBuilder: jest.fn() } as any,
      downloadLogsRepo as any,
      { create: jest.fn(), save: jest.fn() } as any,
      siteService as any,
      storage as any,
      fileCleanup as any,
    );
  });

  it('commits deletion and cleanup intent atomically before processing the file', async () => {
    const order: string[] = [];
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
    textbooksRepo.manager.transaction.mockImplementation(
      async (callback: (manager: any) => Promise<any>) => {
        const result = await callback({
          getRepository: jest.fn(() => ({
            save: jest.fn(async (value) => {
              order.push('save');
              return value;
            }),
          })),
          save: jest.fn(),
        });
        order.push('commit');
        return result;
      },
    );
    fileCleanup.enqueue.mockImplementation(async () => {
      order.push('enqueue');
    });
    fileCleanup.processPending.mockImplementation(async () => {
      order.push('process');
    });

    await service.remove('book-1');

    expect(order).toEqual(['save', 'enqueue', 'commit', 'process']);
    expect(fileCleanup.enqueue).toHaveBeenCalledWith(
      expect.anything(),
      'old-file.pdf',
    );
    expect(fileCleanup.processPending).toHaveBeenCalledWith('old-file.pdf');
    expect(book.fileKey).toBeNull();
    expect(book.fileSize).toBe('0');
    expect(book.checksum).toBeNull();
    expect(book.deletedAt).toBeInstanceOf(Date);
    expect(textbooksRepo.manager.transaction).toHaveBeenCalledTimes(1);
  });

  it('commits source changes and cleanup intent atomically', async () => {
    const order: string[] = [];
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
    textbooksRepo.manager.transaction.mockImplementation(
      async (callback: (manager: any) => Promise<any>) => {
        const result = await callback({
          getRepository: jest.fn(() => ({
            save: jest.fn(async (value) => {
              order.push('save');
              return value;
            }),
          })),
        });
        order.push('commit');
        return result;
      },
    );
    fileCleanup.enqueue.mockImplementation(async () => {
      order.push('enqueue');
    });
    fileCleanup.processPending.mockImplementation(async () => {
      order.push('process');
    });

    await service.update('book-1', {
      sourceType: TextbookSourceType.EXTERNAL_LINK,
      externalUrl: 'https://example.com/book.pdf',
    });

    expect(order).toEqual(['save', 'enqueue', 'commit', 'process']);
    expect(fileCleanup.enqueue).toHaveBeenCalledWith(
      expect.anything(),
      'old-file.pdf',
    );
    expect(book.fileKey).toBeNull();
    expect(book.fileSize).toBe('0');
    expect(book.checksum).toBeNull();
    expect(book.sourceType).toBe(TextbookSourceType.EXTERNAL_LINK);
    expect(textbooksRepo.manager.transaction).toHaveBeenCalledTimes(1);
  });

  it('keeps the committed replacement and queues the old uploaded file', async () => {
    const book = {
      id: 'book-1',
      siteId: 'site-1',
      sourceType: TextbookSourceType.UPLOADED,
      fileKey: 'old-file.pdf',
      fileSize: '123',
      checksum: 'old-checksum',
    };
    const stored = {
      key: 'new-file.pdf',
      size: 456,
      checksum: 'new-checksum',
    };
    textbooksRepo.findOne.mockResolvedValue(book);
    storage.save.mockResolvedValue(stored);

    const result = await service.upload('book-1', {
      buffer: Buffer.from('pdf'),
      originalname: 'book.pdf',
    } as Express.Multer.File);

    expect(result.fileKey).toBe('new-file.pdf');
    expect(result.fileSize).toBe('456');
    expect(result.checksum).toBe('new-checksum');
    expect(textbooksRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ fileKey: 'new-file.pdf' }),
    );
    expect(textbooksRepo.manager.transaction).toHaveBeenCalledTimes(1);
    expect(fileCleanup.enqueue).toHaveBeenCalledWith(
      expect.anything(),
      'old-file.pdf',
    );
    expect(fileCleanup.processPending).toHaveBeenCalledWith('old-file.pdf');
  });

  it('removes only the newly uploaded file when the database transaction fails', async () => {
    const book = {
      id: 'book-1',
      siteId: 'site-1',
      sourceType: TextbookSourceType.UPLOADED,
      fileKey: 'old-file.pdf',
      fileSize: '123',
      checksum: 'old-checksum',
    };
    const databaseError = new Error('transaction failed');
    textbooksRepo.findOne.mockResolvedValue(book);
    storage.save.mockResolvedValue({
      key: 'new-file.pdf',
      size: 456,
      checksum: 'new-checksum',
    });
    textbooksRepo.manager.transaction.mockRejectedValue(databaseError);

    await expect(
      service.upload('book-1', {
        buffer: Buffer.from('pdf'),
        originalname: 'book.pdf',
      } as Express.Multer.File),
    ).rejects.toBe(databaseError);

    expect(fileCleanup.enqueueForRetry).toHaveBeenCalledWith('new-file.pdf');
    expect(fileCleanup.processPending).toHaveBeenCalledWith('new-file.pdf');
  });

  it('does not count a download before the controller confirms the response', async () => {
    textbooksRepo.findOne.mockResolvedValue({
      id: 'book-1',
      slug: 'book-one',
      status: 'published',
      sourceType: TextbookSourceType.EXTERNAL_LINK,
      externalUrl: 'https://example.com/book.pdf',
    });

    await service.getDownload('book-one', '192.0.2.1');

    expect(textbooksRepo.increment).not.toHaveBeenCalled();
    expect(downloadLogsRepo.save).not.toHaveBeenCalled();
  });

  it('exposes download recording for the controller to call after a successful response', async () => {
    const book = { id: 'book-1' } as any;

    await service.recordDownload(book, '192.0.2.1');

    expect(textbooksRepo.increment).toHaveBeenCalledWith(
      { id: 'book-1' },
      'downloadCount',
      1,
    );
    expect(downloadLogsRepo.save).toHaveBeenCalledTimes(1);
  });
});

import { TextbookFileCleanup } from './entities/textbook-file-cleanup.entity';
import { TextbookFileCleanupService } from './textbook-file-cleanup.service';

describe('TextbookFileCleanupService', () => {
  let service: TextbookFileCleanupService;
  let intent: TextbookFileCleanup | null;
  let storage: { remove: jest.Mock };
  let repository: any;
  let manager: any;

  beforeEach(() => {
    intent = Object.assign(new TextbookFileCleanup(), {
      fileKey: 'book.pdf',
      attemptCount: 0,
      nextAttemptAt: new Date(0),
      lastError: null,
      exhaustedAt: null,
    });
    storage = { remove: jest.fn().mockResolvedValue(undefined) };

    const query: any = {
      setLock: jest.fn(() => query),
      setOnLocked: jest.fn(() => query),
      where: jest.fn(() => query),
      andWhere: jest.fn(() => query),
      orderBy: jest.fn(() => query),
      take: jest.fn(() => query),
      getOne: jest.fn(async () => {
        if (
          intent &&
          intent.nextAttemptAt <= new Date() &&
          intent.exhaustedAt === null
        ) {
          return intent;
        }
        return null;
      }),
    };
    manager = {
      getRepository: jest.fn(() => ({
        createQueryBuilder: jest.fn(() => query),
      })),
      remove: jest.fn(async () => {
        intent = null;
      }),
      save: jest.fn(async (_entity, value) => {
        intent = value;
        return value;
      }),
    };
    repository = {
      manager: {
        transaction: jest.fn(async (callback) => callback(manager)),
      },
    };
    service = new TextbookFileCleanupService(repository, storage as any);
  });

  it('removes a due file and then deletes its durable intent', async () => {
    const queuedIntent = intent;
    await service.processPending('book.pdf');

    expect(storage.remove).toHaveBeenCalledWith('book.pdf');
    expect(manager.remove).toHaveBeenCalledWith(
      TextbookFileCleanup,
      queuedIntent,
    );
    expect(intent).toBeNull();
  });

  it('retains failed cleanup as a scheduled retry and succeeds on a later pass', async () => {
    storage.remove
      .mockRejectedValueOnce(new Error('storage unavailable'))
      .mockResolvedValueOnce(undefined);

    await service.processPending('book.pdf');

    expect(intent?.attemptCount).toBe(1);
    expect(intent?.lastError).toBe('storage unavailable');
    expect(intent?.nextAttemptAt.getTime()).toBeGreaterThan(Date.now());
    expect(manager.remove).not.toHaveBeenCalled();

    intent!.nextAttemptAt = new Date(0);
    await service.processPending('book.pdf');

    expect(storage.remove).toHaveBeenCalledTimes(2);
    expect(manager.remove).toHaveBeenCalledTimes(1);
    expect(intent).toBeNull();
  });

  it('stops automatic retries at the bounded limit but retains the intent', async () => {
    storage.remove.mockRejectedValue(new Error('storage unavailable'));

    for (let attempt = 0; attempt < 8; attempt += 1) {
      intent!.nextAttemptAt = new Date(0);
      await service.processPending('book.pdf');
    }

    expect(storage.remove).toHaveBeenCalledTimes(8);
    expect(intent?.attemptCount).toBe(8);
    expect(intent?.exhaustedAt).toBeInstanceOf(Date);
    expect(manager.remove).not.toHaveBeenCalled();

    await service.processPending('book.pdf');
    expect(storage.remove).toHaveBeenCalledTimes(8);
  });
});

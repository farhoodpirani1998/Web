import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import {
  TEXTBOOK_STORAGE,
  TextbookStorage,
} from './textbook-storage.interface';
import { TextbookFileCleanup } from './entities/textbook-file-cleanup.entity';

const MAX_ATTEMPTS = 8;
const MAX_BATCH_SIZE = 10;
const RETRY_BASE_MS = 30_000;
const RETRY_MAX_MS = 60 * 60 * 1000;
const POLL_INTERVAL_MS = 60_000;

@Injectable()
export class TextbookFileCleanupService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(TextbookFileCleanupService.name);
  private timer?: NodeJS.Timeout;
  private processing?: Promise<void>;

  constructor(
    @InjectRepository(TextbookFileCleanup)
    private readonly cleanups: Repository<TextbookFileCleanup>,
    @Inject(TEXTBOOK_STORAGE)
    private readonly storage: TextbookStorage,
  ) {}

  onModuleInit(): void {
    void this.processPending().catch((error: unknown) =>
      this.logWorkerFailure(error),
    );
    this.timer = setInterval(() => {
      void this.processPending().catch((error: unknown) =>
        this.logWorkerFailure(error),
      );
    }, POLL_INTERVAL_MS);
    this.timer.unref();
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  async enqueue(manager: EntityManager, fileKey: string): Promise<void> {
    await manager.getRepository(TextbookFileCleanup).save({ fileKey });
  }

  async enqueueForRetry(fileKey: string): Promise<void> {
    await this.cleanups.manager.transaction((manager) =>
      this.enqueue(manager, fileKey),
    );
  }

  async processPending(fileKey?: string): Promise<void> {
    if (this.processing) return this.processing;
    this.processing = this.processBatch(fileKey);
    try {
      await this.processing;
    } finally {
      this.processing = undefined;
    }
  }

  private async processBatch(fileKey?: string): Promise<void> {
    for (let processed = 0; processed < MAX_BATCH_SIZE; processed += 1) {
      const attempted = await this.processNext(fileKey);
      if (!attempted) return;
    }
  }

  private async processNext(fileKey?: string): Promise<boolean> {
    return this.cleanups.manager.transaction(async (manager) => {
      const query = manager
        .getRepository(TextbookFileCleanup)
        .createQueryBuilder('cleanup')
        .setLock('pessimistic_write')
        .setOnLocked('skip_locked')
        .where('cleanup.nextAttemptAt <= :now', { now: new Date() })
        .andWhere('cleanup.exhaustedAt IS NULL')
        .orderBy('cleanup.nextAttemptAt', 'ASC')
        .take(1);
      if (fileKey) query.andWhere('cleanup.fileKey = :fileKey', { fileKey });

      const intent = await query.getOne();
      if (!intent) return false;

      try {
        await this.storage.remove(intent.fileKey);
      } catch (error) {
        const attemptCount = intent.attemptCount + 1;
        const exhausted = attemptCount >= MAX_ATTEMPTS;
        const message = error instanceof Error ? error.message : String(error);
        const delay = Math.min(
          RETRY_BASE_MS * 2 ** (attemptCount - 1),
          RETRY_MAX_MS,
        );
        intent.attemptCount = attemptCount;
        intent.lastError = message;
        intent.nextAttemptAt = new Date(Date.now() + delay);
        intent.exhaustedAt = exhausted ? new Date() : null;
        await manager.save(TextbookFileCleanup, intent);

        const logMessage =
          `Textbook file cleanup failed for "${intent.fileKey}" ` +
          `(attempt ${attemptCount}/${MAX_ATTEMPTS}): ${message}`;
        if (exhausted) {
          this.logger.error(
            `${logMessage}. Retry limit reached; intent retained for operator recovery.`,
          );
        } else {
          this.logger.warn(logMessage);
        }
        return true;
      }

      await manager.remove(TextbookFileCleanup, intent);
      return true;
    });
  }

  private logWorkerFailure(error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    this.logger.error(`Textbook cleanup worker failed: ${message}`);
  }
}

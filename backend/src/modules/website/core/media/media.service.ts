import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { extname } from 'path';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Media, MediaStatus } from './entities/media.entity';
import { MediaUsage } from './entities/media-usage.entity';
import { STORAGE_PROVIDER, StorageProvider } from './storage/storage.interface';
import { SiteService } from '../site/site.service';
import { WEBSITE_EVENTS } from '../events/events.constants';
import { sanitizeFilename } from './storage/sanitize-filename';
import {
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  MAX_SIZE_BYTES,
  extensionMatchesMimeType,
  matchesAllowedMimeType,
} from './media.constants';

/**
 * `Media` plus how many places currently reference it (see
 * `MediaService.getUsage`/`usageCounts`) — computed on read, not a
 * column, so it's always current and never needs a migration to add.
 */
export type MediaWithUsageCount = Media & { usageCount: number };

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media) private readonly mediaRepo: Repository<Media>,
    @InjectRepository(MediaUsage)
    private readonly usageRepo: Repository<MediaUsage>,
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
    private readonly siteService: SiteService,
    private readonly events: EventEmitter2,
  ) {}

  async upload(file: Express.Multer.File, altText: string): Promise<Media> {
    if (!file?.buffer?.length) {
      throw new BadRequestException('No file uploaded');
    }
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype as (typeof ALLOWED_MIME_TYPES)[number])) {
      throw new BadRequestException(`Unsupported file type: ${file.mimetype}`);
    }
    if (file.size > MAX_SIZE_BYTES) {
      throw new BadRequestException(
        `File exceeds maximum size of ${Math.floor(MAX_SIZE_BYTES / (1024 * 1024))}MB`,
      );
    }
    if (!altText?.trim()) {
      throw new BadRequestException('altText is required for every upload');
    }
    // The declared mimetype is just a client-supplied header — confirm the
    // actual file bytes match one of the allowed formats before it's
    // written to storage. See media.constants.ts for why.
    if (!matchesAllowedMimeType(file.buffer, file.mimetype)) {
      throw new BadRequestException(
        'File content does not match its declared type',
      );
    }
    // Extension is checked against the same allow-list applied to the
    // storage key (sanitizeFilename) so what's validated here is exactly
    // what ends up on disk/S3, then cross-checked against the
    // already-verified content type — a "payload.jpg" whose bytes are
    // actually a PNG is rejected even though each check would pass on
    // its own.
    const extension = extname(sanitizeFilename(file.originalname)).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(extension as (typeof ALLOWED_EXTENSIONS)[number])) {
      throw new BadRequestException(`Unsupported file extension: ${extension || '(none)'}`);
    }
    if (!extensionMatchesMimeType(extension, file.mimetype)) {
      throw new BadRequestException('File extension does not match its content type');
    }

    const { url, storageKey } = await this.storage.upload(file, 'media');

    const media = await this.mediaRepo.save(
      this.mediaRepo.create({
        siteId: this.siteService.getDefaultSiteId(),
        storageKey,
        url,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        altText,
        status: MediaStatus.ACTIVE,
      }),
    );

    this.events.emit(WEBSITE_EVENTS.MEDIA_UPLOADED, { mediaId: media.id });
    return media;
  }

  async findAll(status?: MediaStatus): Promise<MediaWithUsageCount[]> {
    const siteId = this.siteService.getDefaultSiteId();
    const media = await this.mediaRepo.find({
      where: { siteId, ...(status ? { status } : {}) },
      order: { createdAt: 'DESC' },
    });
    if (media.length === 0) return [];

    const counts = await this.usageCounts(media.map((item) => item.id));
    return media.map((item) => ({ ...item, usageCount: counts.get(item.id) ?? 0 }));
  }

  async findOne(id: string): Promise<Media> {
    return this.mediaRepo.findOneByOrFail({ id });
  }

  /**
   * Every place a media asset is currently referenced (one row per
   * `attach`/`detach` pair still standing) — same rows `purge` already
   * counts to decide whether a delete is allowed, just returned instead
   * of counted. Ordered newest-first so the most recently attached
   * usage surfaces first in the admin's usage-details view.
   */
  async getUsage(mediaId: string): Promise<MediaUsage[]> {
    // Confirms the id is a real media row before answering "used
    // nowhere" — otherwise a typo'd/deleted id would silently return an
    // empty list instead of a 404.
    await this.mediaRepo.findOneByOrFail({ id: mediaId });
    return this.usageRepo.find({
      where: { mediaId },
      order: { createdAt: 'DESC' },
    });
  }

  /** `mediaId -> usage row count`, one query for the whole given id list. */
  private async usageCounts(mediaIds: string[]): Promise<Map<string, number>> {
    if (mediaIds.length === 0) return new Map();
    const rows = await this.usageRepo
      .createQueryBuilder('usage')
      .select('usage.mediaId', 'mediaId')
      .addSelect('COUNT(*)', 'count')
      .where('usage.mediaId IN (:...mediaIds)', { mediaIds })
      .groupBy('usage.mediaId')
      .getRawMany<{ mediaId: string; count: string }>();
    return new Map(rows.map((row) => [row.mediaId, parseInt(row.count, 10)]));
  }

  async attach(mediaId: string, entityType: string, entityId: string) {
    await this.usageRepo.save(
      this.usageRepo.create({ mediaId, entityType, entityId }),
    );
  }

  async detach(mediaId: string, entityType: string, entityId: string) {
    await this.usageRepo.delete({ mediaId, entityType, entityId });
  }

  /** Hard-delete only when no usage rows remain — otherwise rejected. */
  async purge(mediaId: string): Promise<void> {
    const usageCount = await this.usageRepo.count({ where: { mediaId } });
    if (usageCount > 0) {
      throw new ConflictException(
        `Cannot purge media still in use in ${usageCount} place(s)`,
      );
    }
    const media = await this.mediaRepo.findOneByOrFail({ id: mediaId });
    await this.storage.delete(media.storageKey);
    await this.mediaRepo.delete({ id: mediaId });
  }

  async archive(mediaId: string): Promise<void> {
    await this.mediaRepo.update({ id: mediaId }, { status: MediaStatus.ARCHIVED });
  }

  /** Delegates to whichever StorageProvider is configured. Used by /health. */
  async checkStorageHealth(): Promise<void> {
    await this.storage.checkHealth();
  }
}

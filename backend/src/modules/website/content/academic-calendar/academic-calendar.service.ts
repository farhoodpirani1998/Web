import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AcademicCalendarEntry,
  AcademicCalendarEntryKind,
} from './entities/academic-calendar-entry.entity';
import { CreateAcademicCalendarEntryDto } from './dto/create-academic-calendar-entry.dto';
import { UpdateAcademicCalendarEntryDto } from './dto/update-academic-calendar-entry.dto';
import { SiteService } from '../../core/site/site.service';
import { OrderingService } from '../../core/ordering/ordering.service';
import { PublishingService } from '../../core/publishing/publishing.service';
import { PublishStatus } from '../../core/publishing/publish-status.enum';
import { RedisService } from '../../core/redis/redis.service';
import { buildPublicCacheKey } from '../../public-api/common/public-cache.constants';

const ENTITY_TYPE = 'academic_calendar_entry';
const TABLE_NAME = 'academic_calendar_entries';

@Injectable()
export class AcademicCalendarService {
  constructor(
    @InjectRepository(AcademicCalendarEntry)
    private readonly entriesRepo: Repository<AcademicCalendarEntry>,
    private readonly siteService: SiteService,
    private readonly ordering: OrderingService,
    private readonly publishing: PublishingService,
    private readonly redis: RedisService,
  ) {}

  async create(
    dto: CreateAcademicCalendarEntryDto,
  ): Promise<AcademicCalendarEntry> {
    const siteId = this.siteService.getDefaultSiteId();
    const maxPosition = await this.entriesRepo
      .createQueryBuilder('entry')
      .select('MAX(entry.position)', 'max')
      .where('entry.siteId = :siteId', { siteId })
      .getRawOne<{ max: number | null }>();

    const created = await this.entriesRepo.save(
      this.entriesRepo.create({
        siteId,
        kind: dto.kind,
        title: dto.title,
        value: dto.value,
        dateRange: dto.dateRange,
        date: dto.date,
        description: dto.description,
        position: (maxPosition?.max ?? -1) + 1,
        status: PublishStatus.DRAFT,
      }),
    );
    await this.invalidatePublicCache();
    return created;
  }

  async findAll(
    status?: PublishStatus,
    kind?: AcademicCalendarEntryKind,
  ): Promise<AcademicCalendarEntry[]> {
    const siteId = this.siteService.getDefaultSiteId();
    const qb = this.entriesRepo
      .createQueryBuilder('entry')
      .where('entry.siteId = :siteId', { siteId });
    if (status) qb.andWhere('entry.status = :status', { status });
    if (kind) qb.andWhere('entry.kind = :kind', { kind });
    return qb.addOrderBy('entry.position', 'ASC').getMany();
  }

  async findOne(id: string): Promise<AcademicCalendarEntry> {
    return this.entriesRepo.findOneByOrFail({ id });
  }

  async update(
    id: string,
    dto: UpdateAcademicCalendarEntryDto,
  ): Promise<AcademicCalendarEntry> {
    const entry = await this.findOne(id);
    if (dto.kind !== undefined) entry.kind = dto.kind;
    if (dto.title !== undefined) entry.title = dto.title;
    if (dto.value !== undefined) entry.value = dto.value ?? undefined;
    if (dto.dateRange !== undefined)
      entry.dateRange = dto.dateRange ?? undefined;
    if (dto.date !== undefined) entry.date = dto.date ?? undefined;
    if (dto.description !== undefined)
      entry.description = dto.description ?? undefined;
    const saved = await this.entriesRepo.save(entry);
    await this.invalidatePublicCache();
    return saved;
  }

  async remove(id: string): Promise<void> {
    await this.entriesRepo.delete({ id });
    await this.invalidatePublicCache();
  }

  async updateStatus(
    id: string,
    to: PublishStatus,
  ): Promise<AcademicCalendarEntry> {
    const entry = await this.findOne(id);
    this.publishing.transition({
      from: entry.status,
      to,
      entityType: ENTITY_TYPE,
      entityId: entry.id,
      siteId: entry.siteId,
    });
    entry.status = to;
    const saved = await this.entriesRepo.save(entry);
    await this.invalidatePublicCache();
    return saved;
  }

  async reorder(orderedIds: string[]): Promise<void> {
    await this.ordering.reorder(
      this.entriesRepo.manager,
      TABLE_NAME,
      orderedIds,
    );
    await this.invalidatePublicCache();
  }

  /** Clears every cached variant of this module's public list after a write. */
  private async invalidatePublicCache(): Promise<void> {
    await this.redis.deleteByPrefix(
      `${buildPublicCacheKey('academic-calendar', 'list')}:`,
    );
  }
}

import { Controller, Get, Header } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Throttle } from '@nestjs/throttler';
import { Repository } from 'typeorm';
import {
  AcademicCalendarEntry,
  AcademicCalendarEntryKind,
} from '../../content/academic-calendar/entities/academic-calendar-entry.entity';
import { PublishStatus } from '../../core/publishing/publish-status.enum';
import { SiteService } from '../../core/site/site.service';
import { RedisService } from '../../core/redis/redis.service';
import { PublicVisibilityService } from '../common/public-visibility.service';
import {
  PUBLIC_THROTTLE,
  PUBLIC_CACHE_CONTROL,
} from '../common/public-rate-limit.constants';
import {
  buildPublicCacheKey,
  PUBLIC_CACHE_TTL_SECONDS,
} from '../common/public-cache.constants';

interface PublicAcademicCalendarEntryDto {
  id: string;
  kind: AcademicCalendarEntryKind;
  title: AcademicCalendarEntry['title'];
  value?: string;
  dateRange?: string;
  date?: string;
  description?: AcademicCalendarEntry['description'];
  position: number;
}

/**
 * Core section (academic calendar page), not feature-flag gated. Returns
 * all published entries position-ordered; the site groups them by `kind`
 * for its five sections. No pagination.
 */
@Throttle(PUBLIC_THROTTLE)
@Controller('public/academic-calendar')
export class PublicAcademicCalendarController {
  constructor(
    @InjectRepository(AcademicCalendarEntry)
    private readonly entriesRepo: Repository<AcademicCalendarEntry>,
    private readonly siteService: SiteService,
    private readonly visibility: PublicVisibilityService,
    private readonly redis: RedisService,
  ) {}

  @Header('Cache-Control', PUBLIC_CACHE_CONTROL)
  @Get()
  async findAll(): Promise<PublicAcademicCalendarEntryDto[]> {
    const cacheKey = buildPublicCacheKey('academic-calendar', 'list');
    const cached =
      await this.redis.get<PublicAcademicCalendarEntryDto[]>(cacheKey);
    if (cached) return cached;

    const siteId = this.siteService.getDefaultSiteId();
    const entries = await this.entriesRepo.find({
      where: { siteId, status: PublishStatus.PUBLISHED },
      order: { position: 'ASC' },
    });
    const visible = this.visibility.filterVisible(entries);

    const dto = visible.map((entry) => ({
      id: entry.id,
      kind: entry.kind,
      title: entry.title,
      value: entry.value,
      dateRange: entry.dateRange,
      date: entry.date,
      description: entry.description,
      position: entry.position,
    }));
    await this.redis.set(cacheKey, dto, PUBLIC_CACHE_TTL_SECONDS);
    return dto;
  }
}

import { Controller, Get, Header, ParseUUIDPipe, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Throttle } from '@nestjs/throttler';
import { Repository } from 'typeorm';
import {
  AdmissionEntry,
  AdmissionEntryKind,
} from '../../content/admissions/entities/admission-entry.entity';
import { CampusScopeService } from '../../content/common/campus-scope.service';
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

interface PublicAdmissionEntryDto {
  id: string;
  kind: AdmissionEntryKind;
  title: AdmissionEntry['title'];
  value?: string;
  description?: AdmissionEntry['description'];
  price?: string;
  period?: string;
  includes?: string[];
  position: number;
  campusId?: string | null;
}

/**
 * Core section (admissions page), not feature-flag gated. Returns all
 * published entries position-ordered; the site groups them by `kind`.
 */
@Throttle(PUBLIC_THROTTLE)
@Controller('public/admissions')
export class PublicAdmissionsController {
  constructor(
    @InjectRepository(AdmissionEntry)
    private readonly entriesRepo: Repository<AdmissionEntry>,
    private readonly siteService: SiteService,
    private readonly visibility: PublicVisibilityService,
    private readonly redis: RedisService,
    private readonly campusScope: CampusScopeService,
  ) {}

  @Header('Cache-Control', PUBLIC_CACHE_CONTROL)
  @Get()
  async findAll(
    @Query('campusId', new ParseUUIDPipe({ optional: true })) campusId?: string,
  ): Promise<PublicAdmissionEntryDto[]> {
    const cacheKey = buildPublicCacheKey('admissions', 'list', campusId);
    const cached = await this.redis.get<PublicAdmissionEntryDto[]>(cacheKey);
    if (cached) return cached;

    const siteId = this.siteService.getDefaultSiteId();
    const qb = this.entriesRepo
      .createQueryBuilder('entry')
      .where('entry.siteId = :siteId', { siteId })
      .andWhere('entry.status = :status', { status: PublishStatus.PUBLISHED });
    this.campusScope.applyPublicFilter(qb, 'entry', campusId);
    const entries = await qb.addOrderBy('entry.position', 'ASC').getMany();
    const visible = this.visibility.filterVisible(entries);

    const dto = visible.map((entry) => ({
      id: entry.id,
      kind: entry.kind,
      title: entry.title,
      value: entry.value,
      description: entry.description,
      price: entry.price,
      period: entry.period,
      includes: entry.includes,
      position: entry.position,
      campusId: entry.campusId,
    }));
    await this.redis.set(cacheKey, dto, PUBLIC_CACHE_TTL_SECONDS);
    return dto;
  }
}

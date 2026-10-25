import { Controller, Get, Header } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Throttle } from '@nestjs/throttler';
import { Repository } from 'typeorm';
import { Statistic } from '../../content/statistics/entities/statistic.entity';
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

interface PublicStatisticDto {
  id: string;
  label: Statistic['label'];
  value: number;
  suffix?: string;
  icon?: string;
  position: number;
}

/**
 * Core section, not feature-flag gated — same shape as
 * PublicFeaturesController (position-ordered, no pagination: a small
 * curated set of counters, not a growing feed).
 */
@Throttle(PUBLIC_THROTTLE)
@Controller('public/statistics')
export class PublicStatisticsController {
  constructor(
    @InjectRepository(Statistic)
    private readonly statisticsRepo: Repository<Statistic>,
    private readonly siteService: SiteService,
    private readonly visibility: PublicVisibilityService,
    private readonly redis: RedisService,
  ) {}

  @Header('Cache-Control', PUBLIC_CACHE_CONTROL)
  @Get()
  async findAll(): Promise<PublicStatisticDto[]> {
    const cacheKey = buildPublicCacheKey('statistics', 'list');
    const cached = await this.redis.get<PublicStatisticDto[]>(cacheKey);
    if (cached) return cached;

    const siteId = this.siteService.getDefaultSiteId();
    const statistics = await this.statisticsRepo.find({
      where: { siteId, status: PublishStatus.PUBLISHED },
      order: { position: 'ASC' },
    });
    const visible = this.visibility.filterVisible(statistics);

    const dto = visible.map((statistic) => ({
      id: statistic.id,
      label: statistic.label,
      value: statistic.value,
      suffix: statistic.suffix,
      icon: statistic.icon,
      position: statistic.position,
    }));
    await this.redis.set(cacheKey, dto, PUBLIC_CACHE_TTL_SECONDS);
    return dto;
  }
}

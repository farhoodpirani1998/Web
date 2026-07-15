import { Controller, Get, Header } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Throttle } from '@nestjs/throttler';
import { Repository } from 'typeorm';
import { Statistic } from '../../content/statistics/entities/statistic.entity';
import { PublishStatus } from '../../core/publishing/publish-status.enum';
import { SiteService } from '../../core/site/site.service';
import { PublicVisibilityService } from '../common/public-visibility.service';
import {
  PUBLIC_THROTTLE,
  PUBLIC_CACHE_CONTROL,
} from '../common/public-rate-limit.constants';

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
@Header('Cache-Control', PUBLIC_CACHE_CONTROL)
@Controller('public/statistics')
export class PublicStatisticsController {
  constructor(
    @InjectRepository(Statistic)
    private readonly statisticsRepo: Repository<Statistic>,
    private readonly siteService: SiteService,
    private readonly visibility: PublicVisibilityService,
  ) {}

  @Get()
  async findAll(): Promise<PublicStatisticDto[]> {
    const siteId = this.siteService.getDefaultSiteId();
    const statistics = await this.statisticsRepo.find({
      where: { siteId, status: PublishStatus.PUBLISHED },
      order: { position: 'ASC' },
    });
    const visible = this.visibility.filterVisible(statistics);

    return visible.map((statistic) => ({
      id: statistic.id,
      label: statistic.label,
      value: statistic.value,
      suffix: statistic.suffix,
      icon: statistic.icon,
      position: statistic.position,
    }));
  }
}

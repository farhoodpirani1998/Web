import { Controller, Get, Header } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Throttle } from '@nestjs/throttler';
import { Repository } from 'typeorm';
import { Feature } from '../../content/features/entities/feature.entity';
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

interface PublicFeatureDto {
  id: string;
  title: Feature['title'];
  description: Feature['description'];
  icon?: string;
  position: number;
}

/** Core section, not feature-flag gated (see SiteFeatureFlags doc). */
@Throttle(PUBLIC_THROTTLE)
@Controller('public/features')
export class PublicFeaturesController {
  constructor(
    @InjectRepository(Feature)
    private readonly featureRepo: Repository<Feature>,
    private readonly siteService: SiteService,
    private readonly visibility: PublicVisibilityService,
    private readonly redis: RedisService,
  ) {}

  @Header('Cache-Control', PUBLIC_CACHE_CONTROL)
  @Get()
  async findAll(): Promise<PublicFeatureDto[]> {
    const cacheKey = buildPublicCacheKey('features', 'list');
    const cached = await this.redis.get<PublicFeatureDto[]>(cacheKey);
    if (cached) return cached;

    const siteId = this.siteService.getDefaultSiteId();
    const features = await this.featureRepo.find({
      where: { siteId, status: PublishStatus.PUBLISHED },
      order: { position: 'ASC' },
    });
    const visible = this.visibility.filterVisible(features);

    const dto = visible.map((feature) => ({
      id: feature.id,
      title: feature.title,
      description: feature.description,
      icon: feature.icon,
      position: feature.position,
    }));
    await this.redis.set(cacheKey, dto, PUBLIC_CACHE_TTL_SECONDS);
    return dto;
  }
}

import { Controller, Get, Header } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Throttle } from '@nestjs/throttler';
import { Repository } from 'typeorm';
import { TrustBadge } from '../../content/trust-badges/entities/trust-badge.entity';
import { PublishStatus } from '../../core/publishing/publish-status.enum';
import { SiteService } from '../../core/site/site.service';
import { RedisService } from '../../core/redis/redis.service';
import { PublicVisibilityService } from '../common/public-visibility.service';
import {
  PublicMediaService,
  PublicMediaRef,
} from '../common/public-media.service';
import {
  PUBLIC_THROTTLE,
  PUBLIC_CACHE_CONTROL,
} from '../common/public-rate-limit.constants';
import {
  buildPublicCacheKey,
  PUBLIC_CACHE_TTL_SECONDS,
} from '../common/public-cache.constants';

export interface PublicTrustBadgeDto {
  id: string;
  name: TrustBadge['name'];
  url?: string;
  image: PublicMediaRef;
  position: number;
}

const PUBLIC_LIST_CACHE_KEY = buildPublicCacheKey('trust-badges', 'list');

@Throttle(PUBLIC_THROTTLE)
@Controller('public/trust-badges')
export class PublicTrustBadgesController {
  constructor(
    @InjectRepository(TrustBadge)
    private readonly trustBadgeRepo: Repository<TrustBadge>,
    private readonly siteService: SiteService,
    private readonly visibility: PublicVisibilityService,
    private readonly media: PublicMediaService,
    private readonly redis: RedisService,
  ) {}

  @Header('Cache-Control', PUBLIC_CACHE_CONTROL)
  @Get()
  async findAll(): Promise<PublicTrustBadgeDto[]> {
    const cached = await this.redis.get<PublicTrustBadgeDto[]>(
      PUBLIC_LIST_CACHE_KEY,
    );
    if (cached) return cached;

    const rows = await this.trustBadgeRepo.find({
      where: {
        siteId: this.siteService.getDefaultSiteId(),
        status: PublishStatus.PUBLISHED,
      },
      order: { position: 'ASC' },
    });
    const visible = this.visibility.filterVisible(rows);
    const mediaMap = await this.media.resolveMany(
      visible.map((badge) => badge.imageMediaId),
    );
    const dto = visible.flatMap((badge) => {
      const image = badge.imageMediaId
        ? mediaMap.get(badge.imageMediaId)
        : undefined;
      if (!image) return [];
      return [
        {
          id: badge.id,
          name: badge.name,
          ...(badge.url ? { url: badge.url } : {}),
          image,
          position: badge.position,
        },
      ];
    });
    await this.redis.set(PUBLIC_LIST_CACHE_KEY, dto, PUBLIC_CACHE_TTL_SECONDS);
    return dto;
  }
}

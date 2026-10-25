import { Controller, Get, Header } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Throttle } from '@nestjs/throttler';
import { Repository } from 'typeorm';
import { Achievement } from '../../content/achievements/entities/achievement.entity';
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

interface PublicAchievementDto {
  id: string;
  value: string;
  label: Achievement['label'];
  icon?: string;
  position: number;
}

/**
 * Core section (homepage band), not feature-flag gated — same reasoning
 * Campus/About give: the achievements band is part of the homepage's
 * fixed composition, not an optional widget. Position-ordered list, no
 * pagination.
 */
@Throttle(PUBLIC_THROTTLE)
@Controller('public/achievements')
export class PublicAchievementsController {
  constructor(
    @InjectRepository(Achievement)
    private readonly achievementsRepo: Repository<Achievement>,
    private readonly siteService: SiteService,
    private readonly visibility: PublicVisibilityService,
    private readonly redis: RedisService,
  ) {}

  @Header('Cache-Control', PUBLIC_CACHE_CONTROL)
  @Get()
  async findAll(): Promise<PublicAchievementDto[]> {
    const cacheKey = buildPublicCacheKey('achievements', 'list');
    const cached = await this.redis.get<PublicAchievementDto[]>(cacheKey);
    if (cached) return cached;

    const siteId = this.siteService.getDefaultSiteId();
    const achievements = await this.achievementsRepo.find({
      where: { siteId, status: PublishStatus.PUBLISHED },
      order: { position: 'ASC' },
    });
    const visible = this.visibility.filterVisible(achievements);

    const dto = visible.map((achievement) => ({
      id: achievement.id,
      value: achievement.value,
      label: achievement.label,
      icon: achievement.icon,
      position: achievement.position,
    }));
    await this.redis.set(cacheKey, dto, PUBLIC_CACHE_TTL_SECONDS);
    return dto;
  }
}

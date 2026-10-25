import { Controller, Get, Header } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Throttle } from '@nestjs/throttler';
import { Repository } from 'typeorm';
import { Testimonial } from '../../content/testimonials/entities/testimonial.entity';
import { PublishStatus } from '../../core/publishing/publish-status.enum';
import { SiteService } from '../../core/site/site.service';
import { SiteSettingsService } from '../../content/site-settings/site-settings.service';
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

interface PublicTestimonialDto {
  id: string;
  authorName: string;
  authorRole?: Testimonial['authorRole'];
  content: Testimonial['content'];
  rating?: number;
  avatar: PublicMediaRef | null;
  position: number;
}

/** Optional section — gated by featureFlags.testimonialsEnabled, empty list when disabled. */
@Throttle(PUBLIC_THROTTLE)
@Controller('public/testimonials')
export class PublicTestimonialsController {
  constructor(
    @InjectRepository(Testimonial)
    private readonly testimonialRepo: Repository<Testimonial>,
    private readonly siteService: SiteService,
    private readonly visibility: PublicVisibilityService,
    private readonly media: PublicMediaService,
    private readonly siteSettings: SiteSettingsService,
    private readonly redis: RedisService,
  ) {}

  @Header('Cache-Control', PUBLIC_CACHE_CONTROL)
  @Get()
  async findAll(): Promise<PublicTestimonialDto[]> {
    // Feature-flag check stays uncached (siteSettings is itself cached) so a
    // toggled-off section returns [] immediately rather than after the TTL.
    const settings = await this.siteSettings.get();
    if (!settings.featureFlags.testimonialsEnabled) return [];

    const cacheKey = buildPublicCacheKey('testimonials', 'list');
    const cached = await this.redis.get<PublicTestimonialDto[]>(cacheKey);
    if (cached) return cached;

    const siteId = this.siteService.getDefaultSiteId();
    const testimonials = await this.testimonialRepo.find({
      where: { siteId, status: PublishStatus.PUBLISHED },
      order: { position: 'ASC' },
    });
    const visible = this.visibility.filterVisible(testimonials);

    const mediaMap = await this.media.resolveMany(
      visible.map((testimonial) => testimonial.avatarMediaId),
    );

    const dto = visible.map((testimonial) => ({
      id: testimonial.id,
      authorName: testimonial.authorName,
      authorRole: testimonial.authorRole,
      content: testimonial.content,
      rating: testimonial.rating,
      avatar: testimonial.avatarMediaId
        ? (mediaMap.get(testimonial.avatarMediaId) ?? null)
        : null,
      position: testimonial.position,
    }));
    await this.redis.set(cacheKey, dto, PUBLIC_CACHE_TTL_SECONDS);
    return dto;
  }
}

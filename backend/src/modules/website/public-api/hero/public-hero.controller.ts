import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HeroSlide } from '../../content/hero/entities/hero-slide.entity';
import { PublishStatus } from '../../core/publishing/publish-status.enum';
import { SiteService } from '../../core/site/site.service';
import { PublicVisibilityService } from '../common/public-visibility.service';
import {
  PublicMediaService,
  PublicMediaRef,
} from '../common/public-media.service';

interface PublicHeroSlideDto {
  id: string;
  heading: HeroSlide['heading'];
  subheading?: HeroSlide['subheading'];
  ctaLabel?: HeroSlide['ctaLabel'];
  ctaUrl?: string;
  backgroundImage: PublicMediaRef | null;
  position: number;
}

/**
 * Core section — not feature-flag gated, same as About/Pages/Navigation
 * (see SiteFeatureFlags doc: only genuinely optional sections get a flag).
 */
@Controller('public/hero')
export class PublicHeroController {
  constructor(
    @InjectRepository(HeroSlide)
    private readonly heroRepo: Repository<HeroSlide>,
    private readonly siteService: SiteService,
    private readonly visibility: PublicVisibilityService,
    private readonly media: PublicMediaService,
  ) {}

  @Get()
  async findAll(): Promise<PublicHeroSlideDto[]> {
    const siteId = this.siteService.getDefaultSiteId();
    const slides = await this.heroRepo.find({
      where: { siteId, status: PublishStatus.PUBLISHED },
      order: { position: 'ASC' },
    });
    // HeroSlide has no publishAt, so this only re-confirms status — kept
    // for consistency with every other public controller in this module.
    const visible = this.visibility.filterVisible(slides);

    const mediaMap = await this.media.resolveMany(
      visible.map((slide) => slide.backgroundMediaId),
    );

    return visible.map((slide) => ({
      id: slide.id,
      heading: slide.heading,
      subheading: slide.subheading,
      ctaLabel: slide.ctaLabel,
      ctaUrl: slide.ctaUrl,
      backgroundImage: slide.backgroundMediaId
        ? (mediaMap.get(slide.backgroundMediaId) ?? null)
        : null,
      position: slide.position,
    }));
  }
}

import { Controller, Get, Header } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Throttle } from '@nestjs/throttler';
import { Repository } from 'typeorm';
import { Feature } from '../../content/features/entities/feature.entity';
import { PublishStatus } from '../../core/publishing/publish-status.enum';
import { SiteService } from '../../core/site/site.service';
import { PublicVisibilityService } from '../common/public-visibility.service';
import {
  PUBLIC_THROTTLE,
  PUBLIC_CACHE_CONTROL,
} from '../common/public-rate-limit.constants';

interface PublicFeatureDto {
  id: string;
  title: Feature['title'];
  description: Feature['description'];
  icon?: string;
  position: number;
}

/** Core section, not feature-flag gated (see SiteFeatureFlags doc). */
@Throttle(PUBLIC_THROTTLE)
@Header('Cache-Control', PUBLIC_CACHE_CONTROL)
@Controller('public/features')
export class PublicFeaturesController {
  constructor(
    @InjectRepository(Feature)
    private readonly featureRepo: Repository<Feature>,
    private readonly siteService: SiteService,
    private readonly visibility: PublicVisibilityService,
  ) {}

  @Get()
  async findAll(): Promise<PublicFeatureDto[]> {
    const siteId = this.siteService.getDefaultSiteId();
    const features = await this.featureRepo.find({
      where: { siteId, status: PublishStatus.PUBLISHED },
      order: { position: 'ASC' },
    });
    const visible = this.visibility.filterVisible(features);

    return visible.map((feature) => ({
      id: feature.id,
      title: feature.title,
      description: feature.description,
      icon: feature.icon,
      position: feature.position,
    }));
  }
}

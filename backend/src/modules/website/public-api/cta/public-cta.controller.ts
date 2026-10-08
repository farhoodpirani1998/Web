import { Controller, Get, Header, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Throttle } from '@nestjs/throttler';
import { Repository } from 'typeorm';
import { CtaBanner } from '../../content/cta/entities/cta.entity';
import { SiteService } from '../../core/site/site.service';
import { SiteSettingsService } from '../../content/site-settings/site-settings.service';
import { PublicVisibilityService } from '../common/public-visibility.service';
import {
  PublicMediaService,
  PublicMediaRef,
} from '../common/public-media.service';
import {
  PUBLIC_THROTTLE,
  PUBLIC_CACHE_CONTROL,
} from '../common/public-rate-limit.constants';

interface PublicCtaDto {
  title: CtaBanner['title'];
  description?: CtaBanner['description'];
  primaryButtonLabel: CtaBanner['primaryButtonLabel'];
  primaryButtonUrl: string;
  secondaryButtonLabel?: CtaBanner['secondaryButtonLabel'];
  secondaryButtonUrl?: string;
  backgroundImage: PublicMediaRef | null;
}

/**
 * Optional section — gated by featureFlags.ctaEnabled, same pattern
 * PublicFaqController/PublicNewsController already use for their own
 * flags. Unlike those list-shaped sections (which fall back to an
 * empty array), CTA is a singleton, so a disabled/unpublished banner
 * 404s instead — same as PublicAboutController does for its own
 * singleton when not yet published.
 */
@Throttle(PUBLIC_THROTTLE)
@Controller('public/cta')
export class PublicCtaController {
  constructor(
    @InjectRepository(CtaBanner)
    private readonly ctaRepo: Repository<CtaBanner>,
    private readonly siteService: SiteService,
    private readonly visibility: PublicVisibilityService,
    private readonly media: PublicMediaService,
    private readonly siteSettings: SiteSettingsService,
  ) {}

  @Header('Cache-Control', PUBLIC_CACHE_CONTROL)
  @Get()
  async get(): Promise<PublicCtaDto> {
    const settings = await this.siteSettings.get();
    if (!settings.featureFlags.ctaEnabled) {
      throw new NotFoundException('CTA banner is disabled');
    }

    const siteId = this.siteService.getDefaultSiteId();
    const cta = await this.ctaRepo.findOne({ where: { siteId } });
    if (!cta || !this.visibility.isVisible(cta)) {
      throw new NotFoundException('CTA banner is not published');
    }

    const backgroundImage = await this.media.resolveOne(cta.backgroundImageMediaId);
    return {
      title: cta.title,
      description: cta.description,
      primaryButtonLabel: cta.primaryButtonLabel,
      primaryButtonUrl: cta.primaryButtonUrl,
      secondaryButtonLabel: cta.secondaryButtonLabel,
      secondaryButtonUrl: cta.secondaryButtonUrl,
      backgroundImage,
    };
  }
}

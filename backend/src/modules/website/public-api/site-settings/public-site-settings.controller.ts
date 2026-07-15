import { Controller, Get, Header } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Throttle } from '@nestjs/throttler';
import { Repository } from 'typeorm';
import { SiteSettingsService } from '../../content/site-settings/site-settings.service';
import { PortalLink } from '../../content/site-settings/entities/portal-link.entity';
import { SiteSettings } from '../../content/site-settings/entities/site-settings.entity';
import { SiteService } from '../../core/site/site.service';
import {
  PublicMediaService,
  PublicMediaRef,
} from '../common/public-media.service';
import {
  PUBLIC_THROTTLE,
  PUBLIC_CACHE_CONTROL,
} from '../common/public-rate-limit.constants';

interface PublicSiteSettingsDto {
  siteName: SiteSettings['siteName'];
  tagline?: SiteSettings['tagline'];
  logo: PublicMediaRef | null;
  favicon: PublicMediaRef | null;
  contactEmail?: string;
  contactPhone?: string;
  address?: SiteSettings['address'];
  mapUrl?: string;
  socialLinks: SiteSettings['socialLinks'];
  defaultSeo: SiteSettings['defaultSeo'];
  featureFlags: SiteSettings['featureFlags'];
}

interface PublicPortalLinkDto {
  id: string;
  label: PortalLink['label'];
  url: string;
  icon?: string;
  position: number;
}

/**
 * Site Settings has no draft/published lifecycle (see entity doc) — it's
 * always "live," so there's nothing for PublicVisibilityService to gate
 * here, unlike every other controller in this module.
 */
@Throttle(PUBLIC_THROTTLE)
@Header('Cache-Control', PUBLIC_CACHE_CONTROL)
@Controller('public/site-settings')
export class PublicSiteSettingsController {
  constructor(
    private readonly siteSettings: SiteSettingsService,
    private readonly media: PublicMediaService,
  ) {}

  @Get()
  async get(): Promise<PublicSiteSettingsDto> {
    const settings = await this.siteSettings.get();
    const [logo, favicon] = await Promise.all([
      this.media.resolveOne(settings.logoMediaId),
      this.media.resolveOne(settings.faviconMediaId),
    ]);

    return {
      siteName: settings.siteName,
      tagline: settings.tagline,
      logo,
      favicon,
      contactEmail: settings.contactEmail,
      contactPhone: settings.contactPhone,
      address: settings.address,
      mapUrl: settings.mapUrl,
      socialLinks: settings.socialLinks,
      defaultSeo: settings.defaultSeo,
      featureFlags: settings.featureFlags,
    };
  }
}

/**
 * Separate controller (own route root), same split PortalLinksModule
 * uses on the admin side — Portal Links is conceptually part of Site
 * Settings but lives in its own table/endpoint.
 */
@Throttle(PUBLIC_THROTTLE)
@Header('Cache-Control', PUBLIC_CACHE_CONTROL)
@Controller('public/portal-links')
export class PublicPortalLinksController {
  constructor(
    @InjectRepository(PortalLink)
    private readonly portalLinkRepo: Repository<PortalLink>,
    private readonly siteService: SiteService,
  ) {}

  @Get()
  async findAll(): Promise<PublicPortalLinkDto[]> {
    const siteId = this.siteService.getDefaultSiteId();
    const links = await this.portalLinkRepo.find({
      where: { siteId, visible: true },
      order: { position: 'ASC' },
    });

    return links.map((link) => ({
      id: link.id,
      label: link.label,
      url: link.url,
      icon: link.icon,
      position: link.position,
    }));
  }
}

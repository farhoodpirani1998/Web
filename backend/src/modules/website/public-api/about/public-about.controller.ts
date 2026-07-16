import { Controller, Get, Header, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { Repository } from 'typeorm';
import { AboutPage } from '../../content/about/entities/about.entity';
import { SiteService } from '../../core/site/site.service';
import { SeoService, PublicSeoDto } from '../../core/seo/seo.service';
import { PublicVisibilityService } from '../common/public-visibility.service';
import {
  PublicMediaService,
  PublicMediaRef,
} from '../common/public-media.service';
import {
  PUBLIC_THROTTLE,
  PUBLIC_CACHE_CONTROL,
} from '../common/public-rate-limit.constants';

interface PublicAboutDto {
  title: AboutPage['title'];
  body: AboutPage['body'];
  image: PublicMediaRef | null;
  seo: PublicSeoDto;
  structuredData: Record<string, unknown>[];
  updatedAt: Date;
}

/** Core section, singleton per site — same shape as PublicSiteSettingsController. */
@Throttle(PUBLIC_THROTTLE)
@Controller('public/about')
export class PublicAboutController {
  constructor(
    @InjectRepository(AboutPage)
    private readonly aboutRepo: Repository<AboutPage>,
    private readonly siteService: SiteService,
    private readonly visibility: PublicVisibilityService,
    private readonly media: PublicMediaService,
    private readonly seo: SeoService,
    private readonly config: ConfigService,
  ) {}

  @Header('Cache-Control', PUBLIC_CACHE_CONTROL)
  @Get()
  async get(): Promise<PublicAboutDto> {
    const siteId = this.siteService.getDefaultSiteId();
    const page = await this.aboutRepo.findOne({ where: { siteId } });
    if (!page || !this.visibility.isVisible(page)) {
      throw new NotFoundException('About page is not published');
    }

    const image = await this.media.resolveOne(page.imageMediaId);
    const baseUrl = this.seo.resolveBaseUrl(this.config);
    const title = SeoService.resolveTranslatable(page.title) ?? 'About';
    return {
      title: page.title,
      body: page.body,
      image,
      seo: this.seo.resolvePublicSeo(page.seo, title, '/about', baseUrl),
      structuredData: [
        this.seo.buildBreadcrumbSchema([
          { name: 'Home', url: baseUrl },
          { name: title, url: `${baseUrl}/about` },
        ]),
      ],
      updatedAt: page.updatedAt,
    };
  }
}

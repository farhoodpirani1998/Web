import {
  Controller,
  Get,
  Header,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { Repository } from 'typeorm';
import { StaticPage } from '../../content/pages/entities/page.entity';
import { SiteService } from '../../core/site/site.service';
import { SeoService, PublicSeoDto } from '../../core/seo/seo.service';
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

interface PublicPageDto {
  id: string;
  title: StaticPage['title'];
  slug: string;
  body: StaticPage['body'];
  template: StaticPage['template'];
  isHomepage: boolean;
  featuredImage: PublicMediaRef | null;
  seo: PublicSeoDto;
  structuredData: Record<string, unknown>[];
  updatedAt: Date;
}

/**
 * Core section — not feature-flag gated. `homepage` is registered
 * before `:slug` so it's never shadowed by the dynamic route.
 */
@Throttle(PUBLIC_THROTTLE)
@Controller('public/pages')
export class PublicPagesController {
  constructor(
    @InjectRepository(StaticPage)
    private readonly pagesRepo: Repository<StaticPage>,
    private readonly siteService: SiteService,
    private readonly visibility: PublicVisibilityService,
    private readonly media: PublicMediaService,
    private readonly seo: SeoService,
    private readonly config: ConfigService,
    private readonly redis: RedisService,
  ) {}

  @Header('Cache-Control', PUBLIC_CACHE_CONTROL)
  @Get('homepage')
  async getHomepage(): Promise<PublicPageDto> {
    const cacheKey = buildPublicCacheKey('pages', 'homepage');
    const cached = await this.redis.get<PublicPageDto>(cacheKey);
    if (cached) return cached;

    const siteId = this.siteService.getDefaultSiteId();
    const page = await this.pagesRepo.findOne({
      where: { siteId, isHomepage: true },
    });
    if (!page || !this.visibility.isVisible(page)) {
      throw new NotFoundException('No published homepage is set for this site');
    }
    const dto = await this.toDto(page);
    await this.redis.set(cacheKey, dto, PUBLIC_CACHE_TTL_SECONDS);
    return dto;
  }

  @Header('Cache-Control', PUBLIC_CACHE_CONTROL)
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string): Promise<PublicPageDto> {
    const cacheKey = buildPublicCacheKey('pages', 'detail', slug);
    const cached = await this.redis.get<PublicPageDto>(cacheKey);
    if (cached) return cached;

    const siteId = this.siteService.getDefaultSiteId();
    const page = await this.pagesRepo.findOne({ where: { siteId, slug } });
    if (!page || !this.visibility.isVisible(page)) {
      throw new NotFoundException(`Page "${slug}" not found`);
    }
    const dto = await this.toDto(page);
    await this.redis.set(cacheKey, dto, PUBLIC_CACHE_TTL_SECONDS);
    return dto;
  }

  private async toDto(page: StaticPage): Promise<PublicPageDto> {
    const image = await this.media.resolveOne(page.featuredImageMediaId);
    const baseUrl = this.seo.resolveBaseUrl(this.config);
    const title = SeoService.resolveTranslatable(page.title) ?? page.slug;
    const canonicalPath = page.isHomepage ? '/' : `/${page.slug}`;
    return {
      id: page.id,
      title: page.title,
      slug: page.slug,
      body: page.body,
      template: page.template,
      isHomepage: page.isHomepage,
      featuredImage: image,
      seo: this.seo.resolvePublicSeo(page.seo, title, canonicalPath, baseUrl),
      structuredData: [
        this.seo.buildBreadcrumbSchema(
          page.isHomepage
            ? [{ name: title, url: baseUrl }]
            : [
                { name: 'Home', url: baseUrl },
                { name: title, url: `${baseUrl}${canonicalPath}` },
              ],
        ),
      ],
      updatedAt: page.updatedAt,
    };
  }
}

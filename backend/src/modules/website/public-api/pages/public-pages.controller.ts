import {
  Controller,
  Get,
  Header,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Throttle } from '@nestjs/throttler';
import { Repository } from 'typeorm';
import { StaticPage } from '../../content/pages/entities/page.entity';
import { SiteService } from '../../core/site/site.service';
import { PublicVisibilityService } from '../common/public-visibility.service';
import {
  PublicMediaService,
  PublicMediaRef,
} from '../common/public-media.service';
import {
  PUBLIC_THROTTLE,
  PUBLIC_CACHE_CONTROL,
} from '../common/public-rate-limit.constants';

interface PublicPageDto {
  id: string;
  title: StaticPage['title'];
  slug: string;
  body: StaticPage['body'];
  template: StaticPage['template'];
  isHomepage: boolean;
  featuredImage: PublicMediaRef | null;
  seo: StaticPage['seo'];
  updatedAt: Date;
}

/**
 * Core section — not feature-flag gated. `homepage` is registered
 * before `:slug` so it's never shadowed by the dynamic route.
 */
@Throttle(PUBLIC_THROTTLE)
@Header('Cache-Control', PUBLIC_CACHE_CONTROL)
@Controller('public/pages')
export class PublicPagesController {
  constructor(
    @InjectRepository(StaticPage)
    private readonly pagesRepo: Repository<StaticPage>,
    private readonly siteService: SiteService,
    private readonly visibility: PublicVisibilityService,
    private readonly media: PublicMediaService,
  ) {}

  @Get('homepage')
  async getHomepage(): Promise<PublicPageDto> {
    const siteId = this.siteService.getDefaultSiteId();
    const page = await this.pagesRepo.findOne({
      where: { siteId, isHomepage: true },
    });
    if (!page || !this.visibility.isVisible(page)) {
      throw new NotFoundException('No published homepage is set for this site');
    }
    return this.toDto(page);
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string): Promise<PublicPageDto> {
    const siteId = this.siteService.getDefaultSiteId();
    const page = await this.pagesRepo.findOne({ where: { siteId, slug } });
    if (!page || !this.visibility.isVisible(page)) {
      throw new NotFoundException(`Page "${slug}" not found`);
    }
    return this.toDto(page);
  }

  private async toDto(page: StaticPage): Promise<PublicPageDto> {
    const image = await this.media.resolveOne(page.featuredImageMediaId);
    return {
      id: page.id,
      title: page.title,
      slug: page.slug,
      body: page.body,
      template: page.template,
      isHomepage: page.isHomepage,
      featuredImage: image,
      seo: page.seo,
      updatedAt: page.updatedAt,
    };
  }
}

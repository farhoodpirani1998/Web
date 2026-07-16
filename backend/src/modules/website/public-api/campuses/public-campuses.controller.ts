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
import { Campus } from '../../content/campuses/entities/campus.entity';
import { PublishStatus } from '../../core/publishing/publish-status.enum';
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

interface PublicCampusListItemDto {
  id: string;
  title: Campus['title'];
  slug: string;
  excerpt?: Campus['excerpt'];
  address?: Campus['address'];
  mapUrl?: string;
  phone?: string;
  email?: string;
  position: number;
  featuredImage: PublicMediaRef | null;
}

interface PublicCampusDetailDto extends PublicCampusListItemDto {
  body: Campus['body'];
  seo: PublicSeoDto;
  structuredData: Record<string, unknown>[];
  updatedAt: Date;
}

/**
 * Core section, not feature-flag gated (see the Campus entity's doc
 * comment) — the list route follows PublicFeaturesController's shape
 * (position-ordered, no pagination, no feature-flag check: a small
 * curated set of campuses, not a growing feed). Each campus is also
 * its own indexable page though, so `:slug` follows
 * PublicNewsController/PublicPagesController's shape instead
 * (visibility check, media resolution, 404 on a missing/unpublished
 * slug).
 */
@Throttle(PUBLIC_THROTTLE)
@Controller('public/campuses')
export class PublicCampusesController {
  constructor(
    @InjectRepository(Campus)
    private readonly campusesRepo: Repository<Campus>,
    private readonly siteService: SiteService,
    private readonly visibility: PublicVisibilityService,
    private readonly media: PublicMediaService,
    private readonly seo: SeoService,
    private readonly config: ConfigService,
  ) {}

  @Header('Cache-Control', PUBLIC_CACHE_CONTROL)
  @Get()
  async findAll(): Promise<PublicCampusListItemDto[]> {
    const siteId = this.siteService.getDefaultSiteId();
    const campuses = await this.campusesRepo.find({
      where: { siteId, status: PublishStatus.PUBLISHED },
      order: { position: 'ASC' },
    });
    const visible = this.visibility.filterVisible(campuses);

    const mediaMap = await this.media.resolveMany(
      visible.map((campus) => campus.featuredImageMediaId),
    );

    return visible.map((campus) => this.toListItem(campus, mediaMap));
  }

  @Header('Cache-Control', PUBLIC_CACHE_CONTROL)
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string): Promise<PublicCampusDetailDto> {
    const siteId = this.siteService.getDefaultSiteId();
    const campus = await this.campusesRepo.findOne({ where: { siteId, slug } });
    if (!campus || !this.visibility.isVisible(campus)) {
      throw new NotFoundException(`Campus "${slug}" not found`);
    }

    const image = await this.media.resolveOne(campus.featuredImageMediaId);
    const baseUrl = this.seo.resolveBaseUrl(this.config);
    const title = SeoService.resolveTranslatable(campus.title) ?? campus.slug;
    const url = `${baseUrl}/campuses/${campus.slug}`;
    return {
      ...this.toListItem(campus, new Map()),
      featuredImage: image,
      body: campus.body,
      seo: this.seo.resolvePublicSeo(campus.seo, title, `/campuses/${campus.slug}`, baseUrl),
      structuredData: [
        this.seo.buildBreadcrumbSchema([
          { name: 'Home', url: baseUrl },
          { name: 'Campuses', url: `${baseUrl}/campuses` },
          { name: title, url },
        ]),
      ],
      updatedAt: campus.updatedAt,
    };
  }

  private toListItem(
    campus: Campus,
    mediaMap: Map<string, PublicMediaRef>,
  ): PublicCampusListItemDto {
    return {
      id: campus.id,
      title: campus.title,
      slug: campus.slug,
      excerpt: campus.excerpt,
      address: campus.address,
      mapUrl: campus.mapUrl,
      phone: campus.phone,
      email: campus.email,
      position: campus.position,
      featuredImage: campus.featuredImageMediaId
        ? (mediaMap.get(campus.featuredImageMediaId) ?? null)
        : null,
    };
  }
}

import { Controller, Get, Header, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Throttle } from '@nestjs/throttler';
import { Repository } from 'typeorm';
import { GalleryItem } from '../../content/gallery/entities/gallery-item.entity';
import { PublishStatus } from '../../core/publishing/publish-status.enum';
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

interface PublicGalleryItemDto {
  id: string;
  image: PublicMediaRef | null;
  caption?: GalleryItem['caption'];
  category?: string;
  position: number;
}

/**
 * Optional section — gated by featureFlags.galleryEnabled. Disabled
 * returns an empty list rather than 404: an off flag means "no items
 * to show," not "this endpoint doesn't exist," so a frontend that
 * always calls it doesn't need special-case error handling.
 */
@Throttle(PUBLIC_THROTTLE)
@Header('Cache-Control', PUBLIC_CACHE_CONTROL)
@Controller('public/gallery')
export class PublicGalleryController {
  constructor(
    @InjectRepository(GalleryItem)
    private readonly galleryRepo: Repository<GalleryItem>,
    private readonly siteService: SiteService,
    private readonly visibility: PublicVisibilityService,
    private readonly media: PublicMediaService,
    private readonly siteSettings: SiteSettingsService,
  ) {}

  @Get()
  async findAll(
    @Query('category') category?: string,
  ): Promise<PublicGalleryItemDto[]> {
    const settings = await this.siteSettings.get();
    if (!settings.featureFlags.galleryEnabled) return [];

    const siteId = this.siteService.getDefaultSiteId();
    const qb = this.galleryRepo
      .createQueryBuilder('item')
      .where('item.siteId = :siteId', { siteId })
      .andWhere('item.status = :status', { status: PublishStatus.PUBLISHED });
    if (category) qb.andWhere('item.category = :category', { category });

    const items = await qb.addOrderBy('item.position', 'ASC').getMany();
    const visible = this.visibility.filterVisible(items);

    const mediaMap = await this.media.resolveMany(
      visible.map((item) => item.imageMediaId),
    );

    return visible.map((item) => ({
      id: item.id,
      image: mediaMap.get(item.imageMediaId) ?? null,
      caption: item.caption,
      category: item.category,
      position: item.position,
    }));
  }
}

import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsArticle } from '../../content/news/entities/news-article.entity';
import { PublishStatus } from '../../core/publishing/publish-status.enum';
import { SiteService } from '../../core/site/site.service';
import { SiteSettingsService } from '../../content/site-settings/site-settings.service';
import { PublicVisibilityService } from '../common/public-visibility.service';
import {
  PublicMediaService,
  PublicMediaRef,
} from '../common/public-media.service';

interface PublicNewsListItemDto {
  id: string;
  title: NewsArticle['title'];
  slug: string;
  excerpt?: NewsArticle['excerpt'];
  category?: string;
  tags?: string[];
  featuredImage: PublicMediaRef | null;
  publishAt?: Date;
}

interface PublicNewsDetailDto extends PublicNewsListItemDto {
  body: NewsArticle['body'];
  seo: NewsArticle['seo'];
  updatedAt: Date;
}

/**
 * Optional section — gated by featureFlags.newsEnabled. Unlike Gallery
 * (empty list when disabled), the detail route 404s when disabled: a
 * direct link to a specific article that's now behind a disabled
 * section genuinely isn't reachable, not merely "no items."
 */
@Controller('public/news')
export class PublicNewsController {
  constructor(
    @InjectRepository(NewsArticle)
    private readonly newsRepo: Repository<NewsArticle>,
    private readonly siteService: SiteService,
    private readonly visibility: PublicVisibilityService,
    private readonly media: PublicMediaService,
    private readonly siteSettings: SiteSettingsService,
  ) {}

  @Get()
  async findAll(
    @Query('category') category?: string,
    @Query('tag') tag?: string,
  ): Promise<PublicNewsListItemDto[]> {
    const settings = await this.siteSettings.get();
    if (!settings.featureFlags.newsEnabled) return [];

    const siteId = this.siteService.getDefaultSiteId();
    const qb = this.newsRepo
      .createQueryBuilder('article')
      .where('article.siteId = :siteId', { siteId })
      .andWhere('article.status = :status', {
        status: PublishStatus.PUBLISHED,
      });
    if (category) qb.andWhere('article.category = :category', { category });
    if (tag) qb.andWhere(':tag = ANY(article.tags)', { tag });

    // Same NULLS LAST reasoning as NewsService.findAll.
    const articles = await qb
      .addOrderBy('article.publishAt', 'DESC', 'NULLS LAST')
      .addOrderBy('article.createdAt', 'DESC')
      .getMany();
    const visible = this.visibility.filterVisible(articles);

    const mediaMap = await this.media.resolveMany(
      visible.map((article) => article.featuredImageMediaId),
    );

    return visible.map((article) => this.toListItem(article, mediaMap));
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string): Promise<PublicNewsDetailDto> {
    const settings = await this.siteSettings.get();
    if (!settings.featureFlags.newsEnabled) {
      throw new NotFoundException(`News article "${slug}" not found`);
    }

    const siteId = this.siteService.getDefaultSiteId();
    const article = await this.newsRepo.findOne({ where: { siteId, slug } });
    if (!article || !this.visibility.isVisible(article)) {
      throw new NotFoundException(`News article "${slug}" not found`);
    }

    const image = await this.media.resolveOne(article.featuredImageMediaId);
    return {
      ...this.toListItem(article, new Map()),
      featuredImage: image,
      body: article.body,
      seo: article.seo,
      updatedAt: article.updatedAt,
    };
  }

  private toListItem(
    article: NewsArticle,
    mediaMap: Map<string, PublicMediaRef>,
  ): PublicNewsListItemDto {
    return {
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      category: article.category,
      tags: article.tags,
      featuredImage: article.featuredImageMediaId
        ? (mediaMap.get(article.featuredImageMediaId) ?? null)
        : null,
      publishAt: article.publishAt,
    };
  }
}

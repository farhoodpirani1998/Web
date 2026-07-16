import {
  Controller,
  DefaultValuePipe,
  Get,
  Header,
  NotFoundException,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { Repository } from 'typeorm';
import { NewsArticle } from '../../content/news/entities/news-article.entity';
import { PublishStatus } from '../../core/publishing/publish-status.enum';
import { SiteService } from '../../core/site/site.service';
import { SeoService, PublicSeoDto } from '../../core/seo/seo.service';
import { SiteSettingsService } from '../../content/site-settings/site-settings.service';
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
import { clampPagination, paginate, PaginatedResult } from '../common/pagination';

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
  seo: PublicSeoDto;
  structuredData: Record<string, unknown>[];
  updatedAt: Date;
}

/**
 * Optional section — gated by featureFlags.newsEnabled. Unlike Gallery
 * (empty page when disabled), the detail route 404s when disabled: a
 * direct link to a specific article that's now behind a disabled
 * section genuinely isn't reachable, not merely "no items."
 */
@Throttle(PUBLIC_THROTTLE)
@Controller('public/news')
export class PublicNewsController {
  constructor(
    @InjectRepository(NewsArticle)
    private readonly newsRepo: Repository<NewsArticle>,
    private readonly siteService: SiteService,
    private readonly visibility: PublicVisibilityService,
    private readonly media: PublicMediaService,
    private readonly siteSettings: SiteSettingsService,
    private readonly seo: SeoService,
    private readonly config: ConfigService,
    private readonly redis: RedisService,
  ) {}

  @Header('Cache-Control', PUBLIC_CACHE_CONTROL)
  @Get()
  async findAll(
    @Query('category') category?: string,
    @Query('tag') tag?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) rawPage = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) rawLimit = 20,
  ): Promise<PaginatedResult<PublicNewsListItemDto>> {
    const { page, limit } = clampPagination(rawPage, rawLimit);
    const cacheKey = buildPublicCacheKey(
      'news',
      'list',
      category,
      tag,
      page,
      limit,
    );
    const cached =
      await this.redis.get<PaginatedResult<PublicNewsListItemDto>>(cacheKey);
    if (cached) return cached;

    const settings = await this.siteSettings.get();
    if (!settings.featureFlags.newsEnabled) {
      return paginate([], 0, page, limit);
    }

    const siteId = this.siteService.getDefaultSiteId();
    const qb = this.newsRepo
      .createQueryBuilder('article')
      .where('article.siteId = :siteId', { siteId })
      .andWhere('article.status = :status', {
        status: PublishStatus.PUBLISHED,
      })
      // Same "not yet due" gate PublicVisibilityService.isVisible applies
      // in-memory, pushed into the query here (rather than relied on
      // in-memory below) so `total`/pagination reflect the true visible
      // set instead of the pre-filter row count.
      .andWhere(
        '(article.publishAt IS NULL OR article.publishAt <= :now)',
        { now: new Date() },
      );
    if (category) qb.andWhere('article.category = :category', { category });
    if (tag) qb.andWhere(':tag = ANY(article.tags)', { tag });

    // Same NULLS LAST reasoning as NewsService.findAll.
    const [articles, total] = await qb
      .addOrderBy('article.publishAt', 'DESC', 'NULLS LAST')
      .addOrderBy('article.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    // Redundant with the SQL gate above by construction — kept as the
    // same defensive pass every other public controller applies.
    const visible = this.visibility.filterVisible(articles);

    const mediaMap = await this.media.resolveMany(
      visible.map((article) => article.featuredImageMediaId),
    );

    const dto = paginate(
      visible.map((article) => this.toListItem(article, mediaMap)),
      total,
      page,
      limit,
    );
    await this.redis.set(cacheKey, dto, PUBLIC_CACHE_TTL_SECONDS);
    return dto;
  }

  @Header('Cache-Control', PUBLIC_CACHE_CONTROL)
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string): Promise<PublicNewsDetailDto> {
    const detailCacheKey = buildPublicCacheKey('news', 'detail', slug);
    const cached = await this.redis.get<PublicNewsDetailDto>(detailCacheKey);
    if (cached) return cached;

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
    const baseUrl = this.seo.resolveBaseUrl(this.config);
    const title = SeoService.resolveTranslatable(article.title) ?? article.slug;
    const url = `${baseUrl}/news/${article.slug}`;
    const publisherName = SeoService.resolveTranslatable(settings.siteName);
    const dto: PublicNewsDetailDto = {
      ...this.toListItem(article, new Map()),
      featuredImage: image,
      body: article.body,
      seo: this.seo.resolvePublicSeo(article.seo, title, `/news/${article.slug}`, baseUrl),
      structuredData: [
        this.seo.buildArticleSchema({
          headline: title,
          description: SeoService.resolveTranslatable(article.excerpt),
          imageUrl: image?.url,
          datePublished: article.publishAt,
          dateModified: article.updatedAt,
          url,
          publisherName,
        }),
        this.seo.buildBreadcrumbSchema([
          { name: 'Home', url: baseUrl },
          { name: 'News', url: `${baseUrl}/news` },
          { name: title, url },
        ]),
      ],
      updatedAt: article.updatedAt,
    };
    await this.redis.set(detailCacheKey, dto, PUBLIC_CACHE_TTL_SECONDS);
    return dto;
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

import { ConflictException, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsArticle } from './entities/news-article.entity';
import { CreateNewsArticleDto } from './dto/create-news-article.dto';
import { UpdateNewsArticleDto } from './dto/update-news-article.dto';
import { SiteService } from '../../core/site/site.service';
import { PublishingService } from '../../core/publishing/publishing.service';
import { PublishStatus } from '../../core/publishing/publish-status.enum';
import { MediaService } from '../../core/media/media.service';
import { SitemapService } from '../../core/seo/sitemap.service';
import { sanitizeTranslatableRichText } from '../common/rich-text-sanitizer';
import {
  RevisionsService,
  RevisionEnabledType,
} from '../../core/revisions/revisions.service';

const ENTITY_TYPE: RevisionEnabledType = 'news_article';

/** Editable fields captured in each revision snapshot — never id/siteId/
 * status/publishAt (workflow metadata, not editorial content — same
 * exclusion Hero/About apply to id/siteId/position/status). */
function snapshotOf(article: NewsArticle): Record<string, unknown> {
  return {
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    body: article.body,
    category: article.category,
    tags: article.tags,
    featuredImageMediaId: article.featuredImageMediaId,
    seo: article.seo,
  };
}

@Injectable()
export class NewsService implements OnModuleInit {
  constructor(
    @InjectRepository(NewsArticle)
    private readonly newsRepo: Repository<NewsArticle>,
    private readonly siteService: SiteService,
    private readonly publishing: PublishingService,
    private readonly media: MediaService,
    private readonly sitemap: SitemapService,
    private readonly revisions: RevisionsService,
  ) {}

  onModuleInit() {
    // Registered once at startup, same provider-function model as
    // AboutService. A PUBLISHED article whose publishAt is still in the
    // future is withheld from the sitemap — this is where "Scheduling"
    // actually takes effect, with no cron/scheduler kernel piece needed.
    this.sitemap.register(async () => {
      const articles = await this.findAll(PublishStatus.PUBLISHED);
      const now = new Date();
      return articles
        .filter((article) => !article.publishAt || article.publishAt <= now)
        .map((article) => ({ loc: `/news/${article.slug}`, lastmod: article.updatedAt }));
    });
  }

  private async assertSlugAvailable(
    siteId: string,
    slug: string,
    excludingId?: string,
  ): Promise<void> {
    const existing = await this.newsRepo.findOne({ where: { siteId, slug } });
    if (existing && existing.id !== excludingId) {
      throw new ConflictException(`Slug "${slug}" is already in use`);
    }
  }

  async create(dto: CreateNewsArticleDto, authorId: string): Promise<NewsArticle> {
    const siteId = this.siteService.getDefaultSiteId();
    await this.assertSlugAvailable(siteId, dto.slug);

    const article = await this.newsRepo.save(
      this.newsRepo.create({
        siteId,
        title: dto.title,
        slug: dto.slug,
        excerpt: dto.excerpt,
        body: sanitizeTranslatableRichText(dto.body),
        category: dto.category,
        tags: dto.tags,
        featuredImageMediaId: dto.featuredImageMediaId,
        seo: dto.seo ?? {},
        status: PublishStatus.DRAFT,
      }),
    );

    if (article.featuredImageMediaId) {
      await this.media.attach(article.featuredImageMediaId, ENTITY_TYPE, article.id);
    }
    await this.revisions.record(ENTITY_TYPE, article.id, snapshotOf(article), authorId);
    return article;
  }

  async findAll(status?: PublishStatus, category?: string): Promise<NewsArticle[]> {
    const siteId = this.siteService.getDefaultSiteId();
    const qb = this.newsRepo
      .createQueryBuilder('article')
      .where('article.siteId = :siteId', { siteId });

    if (status) qb.andWhere('article.status = :status', { status });
    if (category) qb.andWhere('article.category = :category', { category });

    // Reverse-chronological, not manual position — see entity comment.
    // NULLS LAST spelled out explicitly since Postgres defaults DESC to
    // NULLS FIRST, which would float never-scheduled articles to the top.
    return qb
      .addOrderBy('article.publishAt', 'DESC', 'NULLS LAST')
      .addOrderBy('article.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: string): Promise<NewsArticle> {
    return this.newsRepo.findOneByOrFail({ id });
  }

  async update(
    id: string,
    dto: UpdateNewsArticleDto,
    authorId: string,
  ): Promise<NewsArticle> {
    const article = await this.findOne(id);
    const previousFeaturedImageMediaId = article.featuredImageMediaId;

    if (dto.slug !== undefined && dto.slug !== article.slug) {
      await this.assertSlugAvailable(article.siteId, dto.slug, article.id);
      article.slug = dto.slug;
    }
    if (dto.title !== undefined) article.title = dto.title;
    if (dto.excerpt !== undefined) article.excerpt = dto.excerpt;
    if (dto.body !== undefined) article.body = sanitizeTranslatableRichText(dto.body);
    if (dto.category !== undefined) article.category = dto.category;
    if (dto.tags !== undefined) article.tags = dto.tags;
    if (dto.featuredImageMediaId !== undefined) {
      article.featuredImageMediaId = dto.featuredImageMediaId ?? undefined;
    }
    if (dto.seo !== undefined) article.seo = { ...article.seo, ...dto.seo };

    const saved = await this.newsRepo.save(article);

    if (
      dto.featuredImageMediaId !== undefined &&
      dto.featuredImageMediaId !== previousFeaturedImageMediaId
    ) {
      if (previousFeaturedImageMediaId) {
        await this.media.detach(previousFeaturedImageMediaId, ENTITY_TYPE, saved.id);
      }
      if (saved.featuredImageMediaId) {
        await this.media.attach(saved.featuredImageMediaId, ENTITY_TYPE, saved.id);
      }
    }

    await this.revisions.record(ENTITY_TYPE, saved.id, snapshotOf(saved), authorId);
    return saved;
  }

  async remove(id: string): Promise<void> {
    const article = await this.findOne(id);
    if (article.featuredImageMediaId) {
      await this.media.detach(article.featuredImageMediaId, ENTITY_TYPE, article.id);
    }
    await this.newsRepo.delete({ id });
  }

  async updateStatus(id: string, to: PublishStatus): Promise<NewsArticle> {
    const article = await this.findOne(id);
    this.publishing.transition({
      from: article.status,
      to,
      entityType: ENTITY_TYPE,
      entityId: article.id,
      siteId: article.siteId,
    });
    article.status = to;
    return this.newsRepo.save(article);
  }

  async schedule(id: string, publishAt: string | null): Promise<NewsArticle> {
    const article = await this.findOne(id);
    article.publishAt = publishAt ? new Date(publishAt) : undefined;
    return this.newsRepo.save(article);
  }

  async listRevisions(id: string) {
    return this.revisions.list(ENTITY_TYPE, id);
  }

  async restoreRevision(
    id: string,
    versionNumber: number,
    authorId: string,
  ): Promise<NewsArticle> {
    const revision = await this.revisions.getVersion(ENTITY_TYPE, id, versionNumber);
    const snapshot = revision.snapshot as {
      title: NewsArticle['title'];
      slug: NewsArticle['slug'];
      excerpt?: NewsArticle['excerpt'];
      body: NewsArticle['body'];
      category?: NewsArticle['category'];
      tags?: NewsArticle['tags'];
      featuredImageMediaId?: NewsArticle['featuredImageMediaId'];
      seo?: NewsArticle['seo'];
    };
    return this.update(
      id,
      {
        title: snapshot.title,
        // Restoring a past slug re-runs the same uniqueness check as any
        // other edit — if another article has since taken it, restore
        // fails loudly rather than silently keeping the current slug.
        slug: snapshot.slug,
        excerpt: snapshot.excerpt,
        body: snapshot.body,
        category: snapshot.category,
        tags: snapshot.tags,
        featuredImageMediaId: snapshot.featuredImageMediaId ?? null,
        seo: snapshot.seo,
      },
      authorId,
    );
  }
}

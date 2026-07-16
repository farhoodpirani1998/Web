import {
  BadRequestException,
  ConflictException,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StaticPage } from './entities/page.entity';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PageTemplate } from './entities/page-template.enum';
import { SiteService } from '../../core/site/site.service';
import { PublishingService } from '../../core/publishing/publishing.service';
import { PublishStatus } from '../../core/publishing/publish-status.enum';
import { MediaService } from '../../core/media/media.service';
import { SitemapService } from '../../core/seo/sitemap.service';
import { SeoService } from '../../core/seo/seo.service';
import { RedisService } from '../../core/redis/redis.service';
import { buildPublicCacheKey } from '../../public-api/common/public-cache.constants';
import { sanitizeTranslatableRichText } from '../common/rich-text-sanitizer';
import {
  RevisionsService,
  RevisionEnabledType,
} from '../../core/revisions/revisions.service';

const ENTITY_TYPE: RevisionEnabledType = 'static_page';

// Safety net against walking an unexpectedly long (or, from pre-existing
// bad data, cyclic) parent chain — real page trees are shallow, so this
// is never expected to matter in practice. See assertValidParent.
const MAX_ANCESTOR_WALK = 1000;

/** Editable fields captured in each revision snapshot — never id/siteId/
 * status/publishAt/isHomepage (workflow metadata, decided through their
 * own dedicated endpoints, not editorial content — same exclusion
 * News/About apply to id/siteId/status/publishAt). */
function snapshotOf(page: StaticPage): Record<string, unknown> {
  return {
    title: page.title,
    slug: page.slug,
    body: page.body,
    template: page.template,
    parentId: page.parentId,
    showInMenu: page.showInMenu,
    featuredImageMediaId: page.featuredImageMediaId,
    seo: page.seo,
  };
}

@Injectable()
export class PagesService implements OnModuleInit {
  constructor(
    @InjectRepository(StaticPage)
    private readonly pagesRepo: Repository<StaticPage>,
    private readonly siteService: SiteService,
    private readonly publishing: PublishingService,
    private readonly media: MediaService,
    private readonly sitemap: SitemapService,
    private readonly revisions: RevisionsService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Clears the public detail-route cache for one page slug. Pages has
   * no public list route (unlike News/Events), so — unlike
   * NewsService/EventsService — there's no list-prefix to clear here.
   */
  private async invalidateDetail(slug: string | undefined): Promise<void> {
    if (slug) await this.redis.delete(buildPublicCacheKey('pages', 'detail', slug));
  }

  private async invalidateHomepage(): Promise<void> {
    await this.redis.delete(buildPublicCacheKey('pages', 'homepage'));
  }

  onModuleInit() {
    // Same provider-function model as News/About. A PUBLISHED page whose
    // publishAt is still in the future is withheld from the sitemap.
    // The homepage page maps to `/`; every other page maps to `/{slug}`
    // — hierarchy (parentId) is deliberately not reflected in the URL
    // (see the entity's doc comment), so no path-building here.
    this.sitemap.register(async () => {
      const pages = await this.findAll(PublishStatus.PUBLISHED);
      const now = new Date();
      return pages
        .filter((page) => !page.publishAt || page.publishAt <= now)
        .filter((page) => SeoService.isIndexable(page.seo))
        .map((page) => ({
          loc: page.isHomepage ? '/' : `/${page.slug}`,
          lastmod: page.updatedAt,
        }));
    });
  }

  private async assertSlugAvailable(
    siteId: string,
    slug: string,
    excludingId?: string,
  ): Promise<void> {
    const existing = await this.pagesRepo.findOne({ where: { siteId, slug } });
    if (existing && existing.id !== excludingId) {
      throw new ConflictException(`Slug "${slug}" is already in use`);
    }
  }

  /**
   * Confirms `parentId` names an existing page on the same site, and
   * (when updating an existing page, i.e. `pageId` is set) that adopting
   * it would not create a cycle — including the trivial cycle of a page
   * being its own parent.
   */
  private async assertValidParent(
    siteId: string,
    pageId: string | undefined,
    parentId: string,
  ): Promise<void> {
    const parent = await this.pagesRepo.findOne({ where: { id: parentId, siteId } });
    if (!parent) {
      throw new BadRequestException(
        'parentId does not reference an existing page on this site',
      );
    }
    // On create there's no existing pageId yet, so no cycle is possible —
    // existence is all that needs checking.
    if (!pageId) return;

    let currentId: string | undefined = parent.id;
    let steps = 0;
    while (currentId) {
      if (currentId === pageId) {
        throw new BadRequestException(
          'parentId would create a circular page hierarchy',
        );
      }
      if (++steps > MAX_ANCESTOR_WALK) break;
      const current = await this.pagesRepo.findOne({
        where: { id: currentId, siteId },
      });
      currentId = current?.parentId;
    }
  }

  async create(dto: CreatePageDto, authorId: string): Promise<StaticPage> {
    const siteId = this.siteService.getDefaultSiteId();
    await this.assertSlugAvailable(siteId, dto.slug);
    if (dto.parentId) {
      await this.assertValidParent(siteId, undefined, dto.parentId);
    }

    const page = await this.pagesRepo.save(
      this.pagesRepo.create({
        siteId,
        title: dto.title,
        slug: dto.slug,
        body: sanitizeTranslatableRichText(dto.body),
        template: dto.template ?? PageTemplate.DEFAULT,
        parentId: dto.parentId,
        showInMenu: dto.showInMenu ?? true,
        featuredImageMediaId: dto.featuredImageMediaId,
        seo: dto.seo ?? {},
        status: PublishStatus.DRAFT,
      }),
    );

    if (page.featuredImageMediaId) {
      await this.media.attach(page.featuredImageMediaId, ENTITY_TYPE, page.id);
    }
    await this.revisions.record(ENTITY_TYPE, page.id, snapshotOf(page), authorId);
    await this.invalidateDetail(page.slug);
    return page;
  }

  async findAll(status?: PublishStatus, parentId?: string): Promise<StaticPage[]> {
    const siteId = this.siteService.getDefaultSiteId();
    const qb = this.pagesRepo
      .createQueryBuilder('page')
      .where('page.siteId = :siteId', { siteId });

    if (status) qb.andWhere('page.status = :status', { status });
    if (parentId) qb.andWhere('page.parentId = :parentId', { parentId });

    return qb.addOrderBy('page.createdAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<StaticPage> {
    return this.pagesRepo.findOneByOrFail({ id });
  }

  async update(
    id: string,
    dto: UpdatePageDto,
    authorId: string,
  ): Promise<StaticPage> {
    const page = await this.findOne(id);
    const previousSlug = page.slug;
    const previousFeaturedImageMediaId = page.featuredImageMediaId;

    if (dto.slug !== undefined && dto.slug !== page.slug) {
      await this.assertSlugAvailable(page.siteId, dto.slug, page.id);
      page.slug = dto.slug;
    }
    if (dto.title !== undefined) page.title = dto.title;
    if (dto.body !== undefined) page.body = sanitizeTranslatableRichText(dto.body);
    if (dto.template !== undefined) page.template = dto.template;
    if (dto.parentId !== undefined) {
      if (dto.parentId === null) {
        page.parentId = undefined;
      } else {
        await this.assertValidParent(page.siteId, page.id, dto.parentId);
        page.parentId = dto.parentId;
      }
    }
    if (dto.showInMenu !== undefined) page.showInMenu = dto.showInMenu;
    if (dto.featuredImageMediaId !== undefined) {
      page.featuredImageMediaId = dto.featuredImageMediaId ?? undefined;
    }
    if (dto.seo !== undefined) page.seo = { ...page.seo, ...dto.seo };

    const saved = await this.pagesRepo.save(page);

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
    // previousSlug and saved.slug can differ (slug rename) and, unlike
    // News, this page's content can also be served under 'homepage' —
    // clear that too whenever the edited page is the current homepage.
    await this.invalidateDetail(previousSlug);
    await this.invalidateDetail(saved.slug);
    if (saved.isHomepage) await this.invalidateHomepage();
    return saved;
  }

  async remove(id: string): Promise<void> {
    const page = await this.findOne(id);

    // Same guard idiom as MediaService.purge: reject rather than
    // silently orphaning or cascading. The caller re-parents or deletes
    // the children first.
    const childCount = await this.pagesRepo.count({ where: { parentId: page.id } });
    if (childCount > 0) {
      throw new ConflictException(
        'Cannot delete a page that has child pages — move or delete them first',
      );
    }

    if (page.featuredImageMediaId) {
      await this.media.detach(page.featuredImageMediaId, ENTITY_TYPE, page.id);
    }
    await this.pagesRepo.delete({ id });
    await this.invalidateDetail(page.slug);
    if (page.isHomepage) await this.invalidateHomepage();
  }

  async updateStatus(id: string, to: PublishStatus): Promise<StaticPage> {
    const page = await this.findOne(id);
    this.publishing.transition({
      from: page.status,
      to,
      entityType: ENTITY_TYPE,
      entityId: page.id,
      siteId: page.siteId,
    });
    const wasHomepage = page.isHomepage;
    page.status = to;
    // A page that stops being PUBLISHED can no longer serve as the
    // homepage — otherwise the site would have no reachable homepage
    // at all. Re-designating a new one is a separate, explicit action.
    if (page.isHomepage && to !== PublishStatus.PUBLISHED) {
      page.isHomepage = false;
    }
    const saved = await this.pagesRepo.save(page);
    await this.invalidateDetail(saved.slug);
    if (wasHomepage) await this.invalidateHomepage();
    return saved;
  }

  async schedule(id: string, publishAt: string | null): Promise<StaticPage> {
    const page = await this.findOne(id);
    page.publishAt = publishAt ? new Date(publishAt) : undefined;
    const saved = await this.pagesRepo.save(page);
    await this.invalidateDetail(saved.slug);
    if (saved.isHomepage) await this.invalidateHomepage();
    return saved;
  }

  /**
   * Designates (or clears) this page as the site's homepage. Only a
   * PUBLISHED page may be designated. Setting `isHomepage: true` unsets
   * whichever other page previously held it, so exactly one page per
   * site can ever be the homepage at a time — enforced here rather than
   * as a DB constraint (see the entity's `isHomepage` comment).
   */
  async setHomepage(id: string, isHomepage: boolean): Promise<StaticPage> {
    const page = await this.findOne(id);

    if (isHomepage) {
      if (page.status !== PublishStatus.PUBLISHED) {
        throw new BadRequestException('Only a published page can be set as the homepage');
      }
      // Read the previous homepage (if any) before the transaction so its
      // detail cache can be invalidated too — its `isHomepage` field in
      // the cached DTO is about to become stale.
      const previousHomepage = await this.pagesRepo.findOne({
        where: { siteId: page.siteId, isHomepage: true },
      });
      await this.pagesRepo.manager.transaction(async (trx) => {
        await trx.update(
          StaticPage,
          { siteId: page.siteId, isHomepage: true },
          { isHomepage: false },
        );
        await trx.update(StaticPage, { id: page.id }, { isHomepage: true });
      });
      // Re-fetch rather than mutating the in-memory object, so the
      // returned entity reflects the updatedAt the transaction produced.
      const saved = await this.findOne(page.id);
      await this.invalidateHomepage();
      await this.invalidateDetail(saved.slug);
      if (previousHomepage && previousHomepage.id !== saved.id) {
        await this.invalidateDetail(previousHomepage.slug);
      }
      return saved;
    }

    page.isHomepage = false;
    const saved = await this.pagesRepo.save(page);
    await this.invalidateHomepage();
    await this.invalidateDetail(saved.slug);
    return saved;
  }

  async listRevisions(id: string) {
    return this.revisions.list(ENTITY_TYPE, id);
  }

  async restoreRevision(
    id: string,
    versionNumber: number,
    authorId: string,
  ): Promise<StaticPage> {
    const revision = await this.revisions.getVersion(ENTITY_TYPE, id, versionNumber);
    const snapshot = revision.snapshot as {
      title: StaticPage['title'];
      slug: StaticPage['slug'];
      body: StaticPage['body'];
      template?: StaticPage['template'];
      parentId?: StaticPage['parentId'];
      showInMenu?: StaticPage['showInMenu'];
      featuredImageMediaId?: StaticPage['featuredImageMediaId'];
      seo?: StaticPage['seo'];
    };
    return this.update(
      id,
      {
        title: snapshot.title,
        // Restoring a past slug re-runs the same uniqueness check as any
        // other edit — same idiom as News.
        slug: snapshot.slug,
        body: snapshot.body,
        template: snapshot.template,
        // Restoring a past parent re-runs the same existence/cycle check
        // as any other edit; if that ancestor was since deleted or would
        // now form a cycle, restore fails loudly rather than silently
        // keeping the current parent.
        parentId: snapshot.parentId ?? null,
        showInMenu: snapshot.showInMenu,
        featuredImageMediaId: snapshot.featuredImageMediaId ?? null,
        seo: snapshot.seo,
      },
      authorId,
    );
  }
}

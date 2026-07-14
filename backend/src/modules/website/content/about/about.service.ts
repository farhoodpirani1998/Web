import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AboutPage } from './entities/about.entity';
import { UpdateAboutDto } from './dto/update-about.dto';
import { SiteService } from '../../core/site/site.service';
import { PublishingService } from '../../core/publishing/publishing.service';
import { PublishStatus } from '../../core/publishing/publish-status.enum';
import { MediaService } from '../../core/media/media.service';
import { SitemapService } from '../../core/seo/sitemap.service';
import {
  RevisionsService,
  RevisionEnabledType,
} from '../../core/revisions/revisions.service';

const ENTITY_TYPE: RevisionEnabledType = 'about';

/** Editable fields captured in each revision snapshot — never id/siteId/status. */
function snapshotOf(page: AboutPage): Record<string, unknown> {
  return {
    title: page.title,
    body: page.body,
    imageMediaId: page.imageMediaId,
    seo: page.seo,
  };
}

/**
 * About is a singleton per site — there is exactly one row, auto-seeded
 * on startup the same way SiteService seeds the "main" Site row, rather
 * than exposing create/delete endpoints for something that always
 * exists exactly once.
 */
@Injectable()
export class AboutService implements OnModuleInit {
  constructor(
    @InjectRepository(AboutPage)
    private readonly aboutRepo: Repository<AboutPage>,
    private readonly siteService: SiteService,
    private readonly publishing: PublishingService,
    private readonly media: MediaService,
    private readonly sitemap: SitemapService,
    private readonly revisions: RevisionsService,
  ) {}

  async onModuleInit() {
    const siteId = this.siteService.getDefaultSiteId();
    const existing = await this.aboutRepo.findOne({ where: { siteId } });
    if (!existing) {
      await this.aboutRepo.save(
        this.aboutRepo.create({
          siteId,
          title: { fa: 'درباره ما' },
          body: { fa: '' },
          seo: {},
          status: PublishStatus.DRAFT,
        }),
      );
    }

    // Registered once at startup — returns the current row's own state
    // each time /sitemap.xml is generated, per SitemapService's model of
    // provider functions rather than a push-based registry.
    this.sitemap.register(async () => {
      const page = await this.get();
      if (page.status !== PublishStatus.PUBLISHED) return [];
      return [{ loc: '/about', lastmod: page.updatedAt }];
    });
  }

  async get(): Promise<AboutPage> {
    const siteId = this.siteService.getDefaultSiteId();
    return this.aboutRepo.findOneByOrFail({ siteId });
  }

  async update(dto: UpdateAboutDto, authorId: string): Promise<AboutPage> {
    const page = await this.get();
    const previousImageMediaId = page.imageMediaId;

    if (dto.title !== undefined) page.title = dto.title;
    if (dto.body !== undefined) page.body = dto.body;
    if (dto.imageMediaId !== undefined) page.imageMediaId = dto.imageMediaId ?? undefined;
    if (dto.seo !== undefined) page.seo = { ...page.seo, ...dto.seo };

    const saved = await this.aboutRepo.save(page);

    if (dto.imageMediaId !== undefined && dto.imageMediaId !== previousImageMediaId) {
      if (previousImageMediaId) {
        await this.media.detach(previousImageMediaId, ENTITY_TYPE, saved.id);
      }
      if (saved.imageMediaId) {
        await this.media.attach(saved.imageMediaId, ENTITY_TYPE, saved.id);
      }
    }

    await this.revisions.record(ENTITY_TYPE, saved.id, snapshotOf(saved), authorId);
    return saved;
  }

  async updateStatus(to: PublishStatus): Promise<AboutPage> {
    const page = await this.get();
    this.publishing.transition({
      from: page.status,
      to,
      entityType: ENTITY_TYPE,
      entityId: page.id,
      siteId: page.siteId,
    });
    page.status = to;
    return this.aboutRepo.save(page);
  }

  async listRevisions() {
    const page = await this.get();
    return this.revisions.list(ENTITY_TYPE, page.id);
  }

  async restoreRevision(versionNumber: number, authorId: string): Promise<AboutPage> {
    const page = await this.get();
    const revision = await this.revisions.getVersion(ENTITY_TYPE, page.id, versionNumber);
    const snapshot = revision.snapshot as {
      title: AboutPage['title'];
      body: AboutPage['body'];
      imageMediaId?: AboutPage['imageMediaId'];
      seo?: AboutPage['seo'];
    };
    return this.update(
      {
        title: snapshot.title,
        body: snapshot.body,
        imageMediaId: snapshot.imageMediaId ?? null,
        seo: snapshot.seo,
      },
      authorId,
    );
  }
}

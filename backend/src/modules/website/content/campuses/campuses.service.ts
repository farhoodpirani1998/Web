import { ConflictException, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campus } from './entities/campus.entity';
import { CreateCampusDto } from './dto/create-campus.dto';
import { UpdateCampusDto } from './dto/update-campus.dto';
import { SiteService } from '../../core/site/site.service';
import { OrderingService } from '../../core/ordering/ordering.service';
import { PublishingService } from '../../core/publishing/publishing.service';
import { PublishStatus } from '../../core/publishing/publish-status.enum';
import { MediaService } from '../../core/media/media.service';
import { SitemapService } from '../../core/seo/sitemap.service';
import { SeoService } from '../../core/seo/seo.service';
import { sanitizeTranslatableRichText } from '../common/rich-text-sanitizer';
import {
  RevisionsService,
  RevisionEnabledType,
} from '../../core/revisions/revisions.service';

const ENTITY_TYPE: RevisionEnabledType = 'campus';
const TABLE_NAME = 'campuses';

/** Editable fields captured in each revision snapshot — never id/siteId/
 * status/publishAt/position (workflow/ordering metadata, decided through
 * their own dedicated endpoints, not editorial content — same exclusion
 * News/Events/Pages apply to id/siteId/status/publishAt, and StaticPage
 * applies to isHomepage). */
function snapshotOf(campus: Campus): Record<string, unknown> {
  return {
    title: campus.title,
    slug: campus.slug,
    excerpt: campus.excerpt,
    body: campus.body,
    address: campus.address,
    mapUrl: campus.mapUrl,
    phone: campus.phone,
    email: campus.email,
    featuredImageMediaId: campus.featuredImageMediaId,
    seo: campus.seo,
  };
}

@Injectable()
export class CampusesService implements OnModuleInit {
  constructor(
    @InjectRepository(Campus)
    private readonly campusesRepo: Repository<Campus>,
    private readonly siteService: SiteService,
    private readonly ordering: OrderingService,
    private readonly publishing: PublishingService,
    private readonly media: MediaService,
    private readonly sitemap: SitemapService,
    private readonly revisions: RevisionsService,
  ) {}

  onModuleInit() {
    // Same provider-function model as News/Events/Pages. A PUBLISHED
    // campus whose publishAt is still in the future is withheld from
    // the sitemap — this is where "Scheduling" actually takes effect,
    // with no cron/scheduler kernel piece needed. Unlike Events, there
    // is no feature-flag check here: Campuses is core content (see the
    // entity's doc comment), same as Pages/About.
    this.sitemap.register(async () => {
      const campuses = await this.findAll(PublishStatus.PUBLISHED);
      const now = new Date();
      return campuses
        .filter((campus) => !campus.publishAt || campus.publishAt <= now)
        .filter((campus) => SeoService.isIndexable(campus.seo))
        .map((campus) => ({
          loc: `/campuses/${campus.slug}`,
          lastmod: campus.updatedAt,
        }));
    });
  }

  private async assertSlugAvailable(
    siteId: string,
    slug: string,
    excludingId?: string,
  ): Promise<void> {
    const existing = await this.campusesRepo.findOne({ where: { siteId, slug } });
    if (existing && existing.id !== excludingId) {
      throw new ConflictException(`Slug "${slug}" is already in use`);
    }
  }

  async create(dto: CreateCampusDto, authorId: string): Promise<Campus> {
    const siteId = this.siteService.getDefaultSiteId();
    await this.assertSlugAvailable(siteId, dto.slug);

    // New campuses are appended to the end of the current display
    // order — same MAX(position)+1 idiom as FeaturesService.create.
    const maxPosition = await this.campusesRepo
      .createQueryBuilder('campus')
      .select('MAX(campus.position)', 'max')
      .where('campus.siteId = :siteId', { siteId })
      .getRawOne<{ max: number | null }>();

    const campus = await this.campusesRepo.save(
      this.campusesRepo.create({
        siteId,
        title: dto.title,
        slug: dto.slug,
        excerpt: dto.excerpt,
        body: sanitizeTranslatableRichText(dto.body),
        address: dto.address,
        mapUrl: dto.mapUrl,
        phone: dto.phone,
        email: dto.email,
        position: (maxPosition?.max ?? -1) + 1,
        featuredImageMediaId: dto.featuredImageMediaId,
        seo: dto.seo ?? {},
        status: PublishStatus.DRAFT,
      }),
    );

    if (campus.featuredImageMediaId) {
      await this.media.attach(campus.featuredImageMediaId, ENTITY_TYPE, campus.id);
    }
    await this.revisions.record(ENTITY_TYPE, campus.id, snapshotOf(campus), authorId);
    return campus;
  }

  async findAll(status?: PublishStatus): Promise<Campus[]> {
    const siteId = this.siteService.getDefaultSiteId();
    const qb = this.campusesRepo
      .createQueryBuilder('campus')
      .where('campus.siteId = :siteId', { siteId });

    if (status) qb.andWhere('campus.status = :status', { status });

    // Manual position, not chronological — see entity comment.
    return qb.addOrderBy('campus.position', 'ASC').getMany();
  }

  async findOne(id: string): Promise<Campus> {
    return this.campusesRepo.findOneByOrFail({ id });
  }

  async update(
    id: string,
    dto: UpdateCampusDto,
    authorId: string,
  ): Promise<Campus> {
    const campus = await this.findOne(id);
    const previousFeaturedImageMediaId = campus.featuredImageMediaId;

    if (dto.slug !== undefined && dto.slug !== campus.slug) {
      await this.assertSlugAvailable(campus.siteId, dto.slug, campus.id);
      campus.slug = dto.slug;
    }
    if (dto.title !== undefined) campus.title = dto.title;
    if (dto.excerpt !== undefined) campus.excerpt = dto.excerpt;
    if (dto.body !== undefined) campus.body = sanitizeTranslatableRichText(dto.body);
    if (dto.address !== undefined) campus.address = dto.address;
    if (dto.mapUrl !== undefined) campus.mapUrl = dto.mapUrl ?? undefined;
    if (dto.phone !== undefined) campus.phone = dto.phone ?? undefined;
    if (dto.email !== undefined) campus.email = dto.email ?? undefined;

    if (dto.featuredImageMediaId !== undefined) {
      campus.featuredImageMediaId = dto.featuredImageMediaId ?? undefined;
    }
    if (dto.seo !== undefined) campus.seo = { ...campus.seo, ...dto.seo };

    const saved = await this.campusesRepo.save(campus);

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
    const campus = await this.findOne(id);
    if (campus.featuredImageMediaId) {
      await this.media.detach(campus.featuredImageMediaId, ENTITY_TYPE, campus.id);
    }
    await this.campusesRepo.delete({ id });
  }

  async updateStatus(id: string, to: PublishStatus): Promise<Campus> {
    const campus = await this.findOne(id);
    this.publishing.transition({
      from: campus.status,
      to,
      entityType: ENTITY_TYPE,
      entityId: campus.id,
      siteId: campus.siteId,
    });
    campus.status = to;
    return this.campusesRepo.save(campus);
  }

  async schedule(id: string, publishAt: string | null): Promise<Campus> {
    const campus = await this.findOne(id);
    campus.publishAt = publishAt ? new Date(publishAt) : undefined;
    return this.campusesRepo.save(campus);
  }

  /** Same drag-and-drop reorder idiom as FeaturesService.reorder. */
  async reorder(orderedIds: string[]): Promise<void> {
    await this.ordering.reorder(this.campusesRepo.manager, TABLE_NAME, orderedIds);
  }

  async listRevisions(id: string) {
    return this.revisions.list(ENTITY_TYPE, id);
  }

  async restoreRevision(
    id: string,
    versionNumber: number,
    authorId: string,
  ): Promise<Campus> {
    const revision = await this.revisions.getVersion(ENTITY_TYPE, id, versionNumber);
    const snapshot = revision.snapshot as {
      title: Campus['title'];
      slug: Campus['slug'];
      excerpt?: Campus['excerpt'];
      body: Campus['body'];
      address?: Campus['address'];
      mapUrl?: Campus['mapUrl'];
      phone?: Campus['phone'];
      email?: Campus['email'];
      featuredImageMediaId?: Campus['featuredImageMediaId'];
      seo?: Campus['seo'];
    };
    return this.update(
      id,
      {
        title: snapshot.title,
        // Restoring a past slug re-runs the same uniqueness check as any
        // other edit — if another campus has since taken it, restore
        // fails loudly rather than silently keeping the current slug.
        slug: snapshot.slug,
        excerpt: snapshot.excerpt,
        body: snapshot.body,
        address: snapshot.address,
        mapUrl: snapshot.mapUrl ?? null,
        phone: snapshot.phone ?? null,
        email: snapshot.email ?? null,
        featuredImageMediaId: snapshot.featuredImageMediaId ?? null,
        seo: snapshot.seo,
      },
      authorId,
    );
  }
}

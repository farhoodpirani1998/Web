import { ConflictException, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Teacher } from './entities/teacher.entity';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { SiteService } from '../../core/site/site.service';
import { OrderingService } from '../../core/ordering/ordering.service';
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

const ENTITY_TYPE: RevisionEnabledType = 'teacher';
const TABLE_NAME = 'teachers';

/** Editable fields captured in each revision snapshot — never id/siteId/
 * status/publishAt/position (workflow/ordering metadata, decided through
 * their own dedicated endpoints, not editorial content — same exclusion
 * Campus/News/Events/Pages apply to id/siteId/status/publishAt/position). */
function snapshotOf(teacher: Teacher): Record<string, unknown> {
  return {
    fullName: teacher.fullName,
    slug: teacher.slug,
    jobTitle: teacher.jobTitle,
    excerpt: teacher.excerpt,
    bio: teacher.bio,
    department: teacher.department,
    campusId: teacher.campusId,
    phone: teacher.phone,
    email: teacher.email,
    avatarMediaId: teacher.avatarMediaId,
    seo: teacher.seo,
  };
}

@Injectable()
export class TeachersService implements OnModuleInit {
  constructor(
    @InjectRepository(Teacher)
    private readonly teachersRepo: Repository<Teacher>,
    private readonly siteService: SiteService,
    private readonly ordering: OrderingService,
    private readonly publishing: PublishingService,
    private readonly media: MediaService,
    private readonly sitemap: SitemapService,
    private readonly revisions: RevisionsService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Clears the public read cache for one teacher's detail route plus
   * every cached list-page/campusId-filter variant (the list route is
   * keyed by an optional `?campusId=`, same as News' category/tag
   * variants, so a prefix delete is needed rather than a single key).
   */
  private async invalidatePublicCache(...slugs: Array<string | undefined>): Promise<void> {
    for (const slug of slugs) {
      if (slug) await this.redis.delete(buildPublicCacheKey('teachers', 'detail', slug));
    }
    await this.redis.deleteByPrefix(`${buildPublicCacheKey('teachers', 'list')}:`);
  }

  onModuleInit() {
    // Same provider-function model as Campus/News/Events/Pages. A
    // PUBLISHED teacher whose publishAt is still in the future is
    // withheld from the sitemap — this is where "Scheduling" actually
    // takes effect, with no cron/scheduler kernel piece needed. No
    // feature-flag check here: Teachers is core content, same as
    // Campus/Pages/About.
    this.sitemap.register(async () => {
      const teachers = await this.findAll(PublishStatus.PUBLISHED);
      const now = new Date();
      return teachers
        .filter((teacher) => !teacher.publishAt || teacher.publishAt <= now)
        .filter((teacher) => SeoService.isIndexable(teacher.seo))
        .map((teacher) => ({
          loc: `/teachers/${teacher.slug}`,
          lastmod: teacher.updatedAt,
        }));
    });
  }

  private async assertSlugAvailable(
    siteId: string,
    slug: string,
    excludingId?: string,
  ): Promise<void> {
    const existing = await this.teachersRepo.findOne({ where: { siteId, slug } });
    if (existing && existing.id !== excludingId) {
      throw new ConflictException(`Slug "${slug}" is already in use`);
    }
  }

  async create(dto: CreateTeacherDto, authorId: string): Promise<Teacher> {
    const siteId = this.siteService.getDefaultSiteId();
    await this.assertSlugAvailable(siteId, dto.slug);

    // New teachers are appended to the end of the current display
    // order — same MAX(position)+1 idiom as CampusesService.create.
    const maxPosition = await this.teachersRepo
      .createQueryBuilder('teacher')
      .select('MAX(teacher.position)', 'max')
      .where('teacher.siteId = :siteId', { siteId })
      .getRawOne<{ max: number | null }>();

    const teacher = await this.teachersRepo.save(
      this.teachersRepo.create({
        siteId,
        fullName: dto.fullName,
        slug: dto.slug,
        jobTitle: dto.jobTitle,
        excerpt: dto.excerpt,
        bio: sanitizeTranslatableRichText(dto.bio),
        department: dto.department,
        campusId: dto.campusId,
        phone: dto.phone,
        email: dto.email,
        position: (maxPosition?.max ?? -1) + 1,
        avatarMediaId: dto.avatarMediaId,
        seo: dto.seo ?? {},
        status: PublishStatus.DRAFT,
      }),
    );

    if (teacher.avatarMediaId) {
      await this.media.attach(teacher.avatarMediaId, ENTITY_TYPE, teacher.id);
    }
    await this.revisions.record(ENTITY_TYPE, teacher.id, snapshotOf(teacher), authorId);
    await this.invalidatePublicCache(teacher.slug);
    return teacher;
  }

  async findAll(status?: PublishStatus): Promise<Teacher[]> {
    const siteId = this.siteService.getDefaultSiteId();
    const qb = this.teachersRepo
      .createQueryBuilder('teacher')
      .where('teacher.siteId = :siteId', { siteId });

    if (status) qb.andWhere('teacher.status = :status', { status });

    // Manual position, not chronological — see entity comment.
    return qb.addOrderBy('teacher.position', 'ASC').getMany();
  }

  async findOne(id: string): Promise<Teacher> {
    return this.teachersRepo.findOneByOrFail({ id });
  }

  async update(
    id: string,
    dto: UpdateTeacherDto,
    authorId: string,
  ): Promise<Teacher> {
    const teacher = await this.findOne(id);
    const previousSlug = teacher.slug;
    const previousAvatarMediaId = teacher.avatarMediaId;

    if (dto.slug !== undefined && dto.slug !== teacher.slug) {
      await this.assertSlugAvailable(teacher.siteId, dto.slug, teacher.id);
      teacher.slug = dto.slug;
    }
    if (dto.fullName !== undefined) teacher.fullName = dto.fullName;
    if (dto.jobTitle !== undefined) teacher.jobTitle = dto.jobTitle;
    if (dto.excerpt !== undefined) teacher.excerpt = dto.excerpt;
    if (dto.bio !== undefined) teacher.bio = sanitizeTranslatableRichText(dto.bio);
    if (dto.department !== undefined) teacher.department = dto.department;
    if (dto.campusId !== undefined) teacher.campusId = dto.campusId ?? undefined;
    if (dto.phone !== undefined) teacher.phone = dto.phone ?? undefined;
    if (dto.email !== undefined) teacher.email = dto.email ?? undefined;

    if (dto.avatarMediaId !== undefined) {
      teacher.avatarMediaId = dto.avatarMediaId ?? undefined;
    }
    if (dto.seo !== undefined) teacher.seo = { ...teacher.seo, ...dto.seo };

    const saved = await this.teachersRepo.save(teacher);

    if (
      dto.avatarMediaId !== undefined &&
      dto.avatarMediaId !== previousAvatarMediaId
    ) {
      if (previousAvatarMediaId) {
        await this.media.detach(previousAvatarMediaId, ENTITY_TYPE, saved.id);
      }
      if (saved.avatarMediaId) {
        await this.media.attach(saved.avatarMediaId, ENTITY_TYPE, saved.id);
      }
    }

    await this.revisions.record(ENTITY_TYPE, saved.id, snapshotOf(saved), authorId);
    await this.invalidatePublicCache(previousSlug, saved.slug);
    return saved;
  }

  async remove(id: string): Promise<void> {
    const teacher = await this.findOne(id);
    if (teacher.avatarMediaId) {
      await this.media.detach(teacher.avatarMediaId, ENTITY_TYPE, teacher.id);
    }
    await this.teachersRepo.delete({ id });
    await this.invalidatePublicCache(teacher.slug);
  }

  async updateStatus(id: string, to: PublishStatus): Promise<Teacher> {
    const teacher = await this.findOne(id);
    this.publishing.transition({
      from: teacher.status,
      to,
      entityType: ENTITY_TYPE,
      entityId: teacher.id,
      siteId: teacher.siteId,
    });
    teacher.status = to;
    const saved = await this.teachersRepo.save(teacher);
    await this.invalidatePublicCache(saved.slug);
    return saved;
  }

  async schedule(id: string, publishAt: string | null): Promise<Teacher> {
    const teacher = await this.findOne(id);
    teacher.publishAt = publishAt ? new Date(publishAt) : undefined;
    const saved = await this.teachersRepo.save(teacher);
    await this.invalidatePublicCache(saved.slug);
    return saved;
  }

  /** Same drag-and-drop reorder idiom as CampusesService.reorder. */
  async reorder(orderedIds: string[]): Promise<void> {
    await this.ordering.reorder(this.teachersRepo.manager, TABLE_NAME, orderedIds);
    // Reordering changes the list route's response (position order)
    // without touching any individual teacher's updatedAt/slug, so only
    // the list-cache variants — not any detail cache — need clearing.
    await this.invalidatePublicCache();
  }

  async listRevisions(id: string) {
    return this.revisions.list(ENTITY_TYPE, id);
  }

  async restoreRevision(
    id: string,
    versionNumber: number,
    authorId: string,
  ): Promise<Teacher> {
    const revision = await this.revisions.getVersion(ENTITY_TYPE, id, versionNumber);
    const snapshot = revision.snapshot as {
      fullName: Teacher['fullName'];
      slug: Teacher['slug'];
      jobTitle: Teacher['jobTitle'];
      excerpt?: Teacher['excerpt'];
      bio: Teacher['bio'];
      department?: Teacher['department'];
      campusId?: Teacher['campusId'];
      phone?: Teacher['phone'];
      email?: Teacher['email'];
      avatarMediaId?: Teacher['avatarMediaId'];
      seo?: Teacher['seo'];
    };
    return this.update(
      id,
      {
        fullName: snapshot.fullName,
        // Restoring a past slug re-runs the same uniqueness check as any
        // other edit — if another teacher has since taken it, restore
        // fails loudly rather than silently keeping the current slug.
        slug: snapshot.slug,
        jobTitle: snapshot.jobTitle,
        excerpt: snapshot.excerpt,
        bio: snapshot.bio,
        department: snapshot.department,
        campusId: snapshot.campusId ?? null,
        phone: snapshot.phone ?? null,
        email: snapshot.email ?? null,
        avatarMediaId: snapshot.avatarMediaId ?? null,
        seo: snapshot.seo,
      },
      authorId,
    );
  }
}

import {
  BadRequestException,
  ConflictException,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CalendarEvent } from './entities/calendar-event.entity';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';
import { UpdateCalendarEventDto } from './dto/update-calendar-event.dto';
import { SiteService } from '../../core/site/site.service';
import { PublishingService } from '../../core/publishing/publishing.service';
import { PublishStatus } from '../../core/publishing/publish-status.enum';
import { MediaService } from '../../core/media/media.service';
import { SitemapService } from '../../core/seo/sitemap.service';
import { SeoService } from '../../core/seo/seo.service';
import { SiteSettingsService } from '../site-settings/site-settings.service';
import { RedisService } from '../../core/redis/redis.service';
import { buildPublicCacheKey } from '../../public-api/common/public-cache.constants';
import { sanitizeTranslatableRichText } from '../common/rich-text-sanitizer';
import {
  RevisionsService,
  RevisionEnabledType,
} from '../../core/revisions/revisions.service';

const ENTITY_TYPE: RevisionEnabledType = 'calendar_event';

/** Editable fields captured in each revision snapshot — never id/siteId/
 * status/publishAt (workflow metadata, not editorial content — same
 * exclusion News/Pages apply to id/siteId/status/publishAt). */
function snapshotOf(event: CalendarEvent): Record<string, unknown> {
  return {
    title: event.title,
    slug: event.slug,
    excerpt: event.excerpt,
    body: event.body,
    category: event.category,
    tags: event.tags,
    location: event.location,
    locationUrl: event.locationUrl,
    startAt: event.startAt,
    endAt: event.endAt,
    allDay: event.allDay,
    featuredImageMediaId: event.featuredImageMediaId,
    seo: event.seo,
  };
}

@Injectable()
export class EventsService implements OnModuleInit {
  constructor(
    @InjectRepository(CalendarEvent)
    private readonly eventsRepo: Repository<CalendarEvent>,
    private readonly siteService: SiteService,
    private readonly publishing: PublishingService,
    private readonly media: MediaService,
    private readonly sitemap: SitemapService,
    private readonly siteSettings: SiteSettingsService,
    private readonly revisions: RevisionsService,
    private readonly redis: RedisService,
  ) {}

  /** Same reasoning as NewsService.invalidatePublicCache. */
  private async invalidatePublicCache(...slugs: Array<string | undefined>): Promise<void> {
    for (const slug of slugs) {
      if (slug) await this.redis.delete(buildPublicCacheKey('events', 'detail', slug));
    }
    await this.redis.deleteByPrefix(`${buildPublicCacheKey('events', 'list')}:`);
  }

  onModuleInit() {
    // Same provider-function model as News/Pages. Unlike those two,
    // this provider also checks the feature flag itself — per
    // SitemapService's own contract ("disabled sections are expected
    // to return an empty array from their own provider") — since
    // Events, like Gallery/Testimonials/FAQ, is one of the genuinely
    // optional sections (see SiteFeatureFlags.eventsEnabled).
    this.sitemap.register(async () => {
      const settings = await this.siteSettings.get();
      if (!settings.featureFlags.eventsEnabled) return [];

      const events = await this.findAll(PublishStatus.PUBLISHED);
      const now = new Date();
      return events
        .filter((event) => !event.publishAt || event.publishAt <= now)
        .filter((event) => SeoService.isIndexable(event.seo))
        .map((event) => ({ loc: `/events/${event.slug}`, lastmod: event.updatedAt }));
    });
  }

  private async assertSlugAvailable(
    siteId: string,
    slug: string,
    excludingId?: string,
  ): Promise<void> {
    const existing = await this.eventsRepo.findOne({ where: { siteId, slug } });
    if (existing && existing.id !== excludingId) {
      throw new ConflictException(`Slug "${slug}" is already in use`);
    }
  }

  // endAt, when present, must not be before startAt. Service-layer
  // validation only, not a DB constraint — same convention as
  // StaticPage's parent-cycle check.
  private assertValidRange(startAt: Date, endAt?: Date): void {
    if (endAt && endAt < startAt) {
      throw new BadRequestException('endAt cannot be before startAt');
    }
  }

  async create(dto: CreateCalendarEventDto, authorId: string): Promise<CalendarEvent> {
    const siteId = this.siteService.getDefaultSiteId();
    await this.assertSlugAvailable(siteId, dto.slug);

    const startAt = new Date(dto.startAt);
    const endAt = dto.endAt ? new Date(dto.endAt) : undefined;
    this.assertValidRange(startAt, endAt);

    const event = await this.eventsRepo.save(
      this.eventsRepo.create({
        siteId,
        title: dto.title,
        slug: dto.slug,
        excerpt: dto.excerpt,
        body: sanitizeTranslatableRichText(dto.body),
        category: dto.category,
        tags: dto.tags,
        location: dto.location,
        locationUrl: dto.locationUrl,
        startAt,
        endAt,
        allDay: dto.allDay ?? false,
        featuredImageMediaId: dto.featuredImageMediaId,
        seo: dto.seo ?? {},
        status: PublishStatus.DRAFT,
      }),
    );

    if (event.featuredImageMediaId) {
      await this.media.attach(event.featuredImageMediaId, ENTITY_TYPE, event.id);
    }
    await this.revisions.record(ENTITY_TYPE, event.id, snapshotOf(event), authorId);
    await this.invalidatePublicCache(event.slug);
    return event;
  }

  async findAll(status?: PublishStatus, category?: string): Promise<CalendarEvent[]> {
    const siteId = this.siteService.getDefaultSiteId();
    const qb = this.eventsRepo
      .createQueryBuilder('event')
      .where('event.siteId = :siteId', { siteId });

    if (status) qb.andWhere('event.status = :status', { status });
    if (category) qb.andWhere('event.category = :category', { category });

    // Chronological by when the event happens, not manual position —
    // see entity comment. Soonest-first, both for drafts and published.
    return qb.addOrderBy('event.startAt', 'ASC').getMany();
  }

  async findOne(id: string): Promise<CalendarEvent> {
    return this.eventsRepo.findOneByOrFail({ id });
  }

  async update(
    id: string,
    dto: UpdateCalendarEventDto,
    authorId: string,
  ): Promise<CalendarEvent> {
    const event = await this.findOne(id);
    const previousSlug = event.slug;
    const previousFeaturedImageMediaId = event.featuredImageMediaId;

    if (dto.slug !== undefined && dto.slug !== event.slug) {
      await this.assertSlugAvailable(event.siteId, dto.slug, event.id);
      event.slug = dto.slug;
    }
    if (dto.title !== undefined) event.title = dto.title;
    if (dto.excerpt !== undefined) event.excerpt = dto.excerpt;
    if (dto.body !== undefined) event.body = sanitizeTranslatableRichText(dto.body);
    if (dto.category !== undefined) event.category = dto.category;
    if (dto.tags !== undefined) event.tags = dto.tags;
    if (dto.location !== undefined) event.location = dto.location;
    if (dto.locationUrl !== undefined) event.locationUrl = dto.locationUrl ?? undefined;
    if (dto.startAt !== undefined) event.startAt = new Date(dto.startAt);
    if (dto.endAt !== undefined) event.endAt = dto.endAt ? new Date(dto.endAt) : undefined;
    if (dto.allDay !== undefined) event.allDay = dto.allDay;
    this.assertValidRange(event.startAt, event.endAt);

    if (dto.featuredImageMediaId !== undefined) {
      event.featuredImageMediaId = dto.featuredImageMediaId ?? undefined;
    }
    if (dto.seo !== undefined) event.seo = { ...event.seo, ...dto.seo };

    const saved = await this.eventsRepo.save(event);

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
    await this.invalidatePublicCache(previousSlug, saved.slug);
    return saved;
  }

  async remove(id: string): Promise<void> {
    const event = await this.findOne(id);
    if (event.featuredImageMediaId) {
      await this.media.detach(event.featuredImageMediaId, ENTITY_TYPE, event.id);
    }
    await this.eventsRepo.delete({ id });
    await this.invalidatePublicCache(event.slug);
  }

  async updateStatus(id: string, to: PublishStatus): Promise<CalendarEvent> {
    const event = await this.findOne(id);
    this.publishing.transition({
      from: event.status,
      to,
      entityType: ENTITY_TYPE,
      entityId: event.id,
      siteId: event.siteId,
    });
    event.status = to;
    const saved = await this.eventsRepo.save(event);
    await this.invalidatePublicCache(saved.slug);
    return saved;
  }

  async schedule(id: string, publishAt: string | null): Promise<CalendarEvent> {
    const event = await this.findOne(id);
    event.publishAt = publishAt ? new Date(publishAt) : undefined;
    const saved = await this.eventsRepo.save(event);
    await this.invalidatePublicCache(saved.slug);
    return saved;
  }

  async listRevisions(id: string) {
    return this.revisions.list(ENTITY_TYPE, id);
  }

  async restoreRevision(
    id: string,
    versionNumber: number,
    authorId: string,
  ): Promise<CalendarEvent> {
    const revision = await this.revisions.getVersion(ENTITY_TYPE, id, versionNumber);
    const snapshot = revision.snapshot as {
      title: CalendarEvent['title'];
      slug: CalendarEvent['slug'];
      excerpt?: CalendarEvent['excerpt'];
      body: CalendarEvent['body'];
      category?: CalendarEvent['category'];
      tags?: CalendarEvent['tags'];
      location?: CalendarEvent['location'];
      locationUrl?: CalendarEvent['locationUrl'];
      startAt: CalendarEvent['startAt'];
      endAt?: CalendarEvent['endAt'];
      allDay: CalendarEvent['allDay'];
      featuredImageMediaId?: CalendarEvent['featuredImageMediaId'];
      seo?: CalendarEvent['seo'];
    };
    return this.update(
      id,
      {
        title: snapshot.title,
        // Restoring a past slug re-runs the same uniqueness check as any
        // other edit — if another event has since taken it, restore
        // fails loudly rather than silently keeping the current slug.
        slug: snapshot.slug,
        excerpt: snapshot.excerpt,
        body: snapshot.body,
        category: snapshot.category,
        tags: snapshot.tags,
        location: snapshot.location,
        locationUrl: snapshot.locationUrl ?? null,
        startAt:
          snapshot.startAt instanceof Date
            ? snapshot.startAt.toISOString()
            : snapshot.startAt,
        endAt: snapshot.endAt
          ? snapshot.endAt instanceof Date
            ? snapshot.endAt.toISOString()
            : snapshot.endAt
          : null,
        allDay: snapshot.allDay,
        featuredImageMediaId: snapshot.featuredImageMediaId ?? null,
        seo: snapshot.seo,
      },
      authorId,
    );
  }
}

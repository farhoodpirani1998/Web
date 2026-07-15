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
import { Throttle } from '@nestjs/throttler';
import { Repository } from 'typeorm';
import { CalendarEvent } from '../../content/events/entities/calendar-event.entity';
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
import { clampPagination, paginate, PaginatedResult } from '../common/pagination';

interface PublicEventListItemDto {
  id: string;
  title: CalendarEvent['title'];
  slug: string;
  excerpt?: CalendarEvent['excerpt'];
  category?: string;
  tags?: string[];
  location?: CalendarEvent['location'];
  locationUrl?: string;
  startAt: Date;
  endAt?: Date;
  allDay: boolean;
  featuredImage: PublicMediaRef | null;
}

interface PublicEventDetailDto extends PublicEventListItemDto {
  body: CalendarEvent['body'];
  seo: CalendarEvent['seo'];
  updatedAt: Date;
}

/**
 * Optional section — gated by featureFlags.eventsEnabled, same idiom
 * as PublicNewsController. The detail route 404s when disabled: a
 * direct link to a specific event that's now behind a disabled
 * section genuinely isn't reachable, not merely "no items."
 */
@Throttle(PUBLIC_THROTTLE)
@Header('Cache-Control', PUBLIC_CACHE_CONTROL)
@Controller('public/events')
export class PublicEventsController {
  constructor(
    @InjectRepository(CalendarEvent)
    private readonly eventsRepo: Repository<CalendarEvent>,
    private readonly siteService: SiteService,
    private readonly visibility: PublicVisibilityService,
    private readonly media: PublicMediaService,
    private readonly siteSettings: SiteSettingsService,
  ) {}

  @Get()
  async findAll(
    @Query('category') category?: string,
    @Query('tag') tag?: string,
    // 'upcoming' (default) shows events that haven't finished yet —
    // the normal "what's happening" reading of an events list; 'past'
    // and 'all' exist for archive/history views. Distinct from News,
    // which has no equivalent time-window concept (an article doesn't
    // "end").
    @Query('when') when: 'upcoming' | 'past' | 'all' = 'upcoming',
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) rawPage = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) rawLimit = 20,
  ): Promise<PaginatedResult<PublicEventListItemDto>> {
    const { page, limit } = clampPagination(rawPage, rawLimit);

    const settings = await this.siteSettings.get();
    if (!settings.featureFlags.eventsEnabled) {
      return paginate([], 0, page, limit);
    }

    const siteId = this.siteService.getDefaultSiteId();
    const now = new Date();
    const qb = this.eventsRepo
      .createQueryBuilder('event')
      .where('event.siteId = :siteId', { siteId })
      .andWhere('event.status = :status', {
        status: PublishStatus.PUBLISHED,
      })
      // Same "not yet due" gate PublicVisibilityService.isVisible applies
      // in-memory, pushed into the query here (rather than relied on
      // in-memory below) so `total`/pagination reflect the true visible
      // set instead of the pre-filter row count.
      .andWhere(
        '(event.publishAt IS NULL OR event.publishAt <= :now)',
        { now },
      );
    if (category) qb.andWhere('event.category = :category', { category });
    if (tag) qb.andWhere(':tag = ANY(event.tags)', { tag });

    // An event is "over" once its end (or, lacking one, its start) has
    // passed — the same rule used for 'past' below, inverted.
    if (when === 'upcoming') {
      qb.andWhere(
        '(COALESCE(event.endAt, event.startAt) >= :now)',
        { now },
      );
    } else if (when === 'past') {
      qb.andWhere(
        '(COALESCE(event.endAt, event.startAt) < :now)',
        { now },
      );
    }

    const [events, total] = await qb
      .addOrderBy('event.startAt', when === 'past' ? 'DESC' : 'ASC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    // Redundant with the SQL gate above by construction — kept as the
    // same defensive pass every other public controller applies.
    const visible = this.visibility.filterVisible(events);

    const mediaMap = await this.media.resolveMany(
      visible.map((event) => event.featuredImageMediaId),
    );

    return paginate(
      visible.map((event) => this.toListItem(event, mediaMap)),
      total,
      page,
      limit,
    );
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string): Promise<PublicEventDetailDto> {
    const settings = await this.siteSettings.get();
    if (!settings.featureFlags.eventsEnabled) {
      throw new NotFoundException(`Event "${slug}" not found`);
    }

    const siteId = this.siteService.getDefaultSiteId();
    const event = await this.eventsRepo.findOne({ where: { siteId, slug } });
    if (!event || !this.visibility.isVisible(event)) {
      throw new NotFoundException(`Event "${slug}" not found`);
    }

    const image = await this.media.resolveOne(event.featuredImageMediaId);
    return {
      ...this.toListItem(event, new Map()),
      featuredImage: image,
      body: event.body,
      seo: event.seo,
      updatedAt: event.updatedAt,
    };
  }

  private toListItem(
    event: CalendarEvent,
    mediaMap: Map<string, PublicMediaRef>,
  ): PublicEventListItemDto {
    return {
      id: event.id,
      title: event.title,
      slug: event.slug,
      excerpt: event.excerpt,
      category: event.category,
      tags: event.tags,
      location: event.location,
      locationUrl: event.locationUrl,
      startAt: event.startAt,
      endAt: event.endAt,
      allDay: event.allDay,
      featuredImage: event.featuredImageMediaId
        ? (mediaMap.get(event.featuredImageMediaId) ?? null)
        : null,
    };
  }
}

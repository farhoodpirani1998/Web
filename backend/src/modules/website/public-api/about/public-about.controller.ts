import { Controller, Get, Header, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { Repository } from 'typeorm';
import { AboutPage } from '../../content/about/entities/about.entity';
import {
  AboutStatItem,
  AboutTeamMember,
  AboutTimelineItem,
  AboutValueItem,
} from '../../content/about/entities/about-sections.types';
import { SiteService } from '../../core/site/site.service';
import { SeoService, PublicSeoDto } from '../../core/seo/seo.service';
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

interface PublicAboutDto {
  title: AboutPage['title'];
  body: AboutPage['body'];
  image: PublicMediaRef | null;
  sections: PublicAboutSections;
  seo: PublicSeoDto;
  structuredData: Record<string, unknown>[];
  updatedAt: Date;
}

interface PublicAboutSection<TItem> {
  title?: AboutPage['title'];
  description?: AboutPage['body'];
  items: TItem[];
}

interface PublicAboutTeamMember extends Omit<AboutTeamMember, 'avatarMediaId'> {
  avatar: PublicMediaRef | null;
}

interface PublicAboutSections {
  stats: PublicAboutSection<AboutStatItem>;
  values: PublicAboutSection<AboutValueItem>;
  timeline: PublicAboutSection<AboutTimelineItem>;
  team: PublicAboutSection<PublicAboutTeamMember>;
  faq?: {
    title?: AboutPage['title'];
    description?: AboutPage['body'];
  };
}

/** Core section, singleton per site — same shape as PublicSiteSettingsController. */
@Throttle(PUBLIC_THROTTLE)
@Controller('public/about')
export class PublicAboutController {
  constructor(
    @InjectRepository(AboutPage)
    private readonly aboutRepo: Repository<AboutPage>,
    private readonly siteService: SiteService,
    private readonly visibility: PublicVisibilityService,
    private readonly media: PublicMediaService,
    private readonly seo: SeoService,
    private readonly config: ConfigService,
    private readonly redis: RedisService,
  ) {}

  @Header('Cache-Control', PUBLIC_CACHE_CONTROL)
  @Get()
  async get(): Promise<PublicAboutDto> {
    const cacheKey = buildPublicCacheKey('about', 'singleton');
    const cached = await this.redis.get<PublicAboutDto>(cacheKey);
    if (cached) return cached;

    const siteId = this.siteService.getDefaultSiteId();
    const page = await this.aboutRepo.findOne({ where: { siteId } });
    if (!page || !this.visibility.isVisible(page)) {
      // Not published → 404, and deliberately not cached (an unpublished
      // singleton should start serving the moment it's published).
      throw new NotFoundException('About page is not published');
    }

    const sections = page.sections ?? {};
    const teamItems = sections.team?.items ?? [];
    const [image, teamMedia] = await Promise.all([
      this.media.resolveOne(page.imageMediaId),
      this.media.resolveMany(teamItems.map((member) => member.avatarMediaId)),
    ]);
    const publicTeam = teamItems.map((member) => {
      const { avatarMediaId, ...content } = member;
      return {
        ...content,
        avatar: avatarMediaId ? (teamMedia.get(avatarMediaId) ?? null) : null,
      };
    });
    const baseUrl = this.seo.resolveBaseUrl(this.config);
    const title = SeoService.resolveTranslatable(page.title) ?? 'About';
    const dto: PublicAboutDto = {
      title: page.title,
      body: page.body,
      image,
      sections: {
        stats: { ...sections.stats, items: sections.stats?.items ?? [] },
        values: { ...sections.values, items: sections.values?.items ?? [] },
        timeline: {
          ...sections.timeline,
          items: sections.timeline?.items ?? [],
        },
        team: { ...sections.team, items: publicTeam },
        faq: sections.faq,
      },
      seo: this.seo.resolvePublicSeo(page.seo, title, '/about', baseUrl),
      structuredData: [
        this.seo.buildBreadcrumbSchema([
          { name: 'Home', url: baseUrl },
          { name: title, url: `${baseUrl}/about` },
        ]),
      ],
      updatedAt: page.updatedAt,
    };
    await this.redis.set(cacheKey, dto, PUBLIC_CACHE_TTL_SECONDS);
    return dto;
  }
}

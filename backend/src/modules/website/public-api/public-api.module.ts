import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HeroSlide } from '../content/hero/entities/hero-slide.entity';
import { AboutPage } from '../content/about/entities/about.entity';
import { Feature } from '../content/features/entities/feature.entity';
import { Statistic } from '../content/statistics/entities/statistic.entity';
import { CtaBanner } from '../content/cta/entities/cta.entity';
import { GalleryItem } from '../content/gallery/entities/gallery-item.entity';
import { NewsArticle } from '../content/news/entities/news-article.entity';
import { StaticPage } from '../content/pages/entities/page.entity';
import { CalendarEvent } from '../content/events/entities/calendar-event.entity';
import { Campus } from '../content/campuses/entities/campus.entity';
import { Teacher } from '../content/teachers/entities/teacher.entity';
import { Faq } from '../content/faq/entities/faq.entity';
import { Testimonial } from '../content/testimonials/entities/testimonial.entity';
import { Menu } from '../content/navigation/entities/menu.entity';
import { MenuItem } from '../content/navigation/entities/menu-item.entity';
import { PortalLink } from '../content/site-settings/entities/portal-link.entity';
import { Media } from '../core/media/entities/media.entity';
import { SiteModule } from '../core/site/site.module';
import { SeoModule } from '../core/seo/seo.module';
import { RedisModule } from '../core/redis/redis.module';
import { SiteSettingsModule } from '../content/site-settings/site-settings.module';
import { PublicVisibilityService } from './common/public-visibility.service';
import { PublicMediaService } from './common/public-media.service';
import { PublicSitemapController } from './sitemap/public-sitemap.controller';
import { PublicHeroController } from './hero/public-hero.controller';
import { PublicAboutController } from './about/public-about.controller';
import { PublicFeaturesController } from './features/public-features.controller';
import { PublicStatisticsController } from './statistics/public-statistics.controller';
import { PublicCtaController } from './cta/public-cta.controller';
import { PublicGalleryController } from './gallery/public-gallery.controller';
import { PublicNewsController } from './news/public-news.controller';
import { PublicPagesController } from './pages/public-pages.controller';
import { PublicEventsController } from './events/public-events.controller';
import { PublicCampusesController } from './campuses/public-campuses.controller';
import { PublicTeachersController } from './teachers/public-teachers.controller';
import { PublicFaqController } from './faq/public-faq.controller';
import { PublicTestimonialsController } from './testimonials/public-testimonials.controller';
import { PublicNavigationController } from './navigation/public-navigation.controller';
import {
  PublicSiteSettingsController,
  PublicPortalLinksController,
} from './site-settings/public-site-settings.controller';

/**
 * Phase 6 — the public, unauthenticated read layer (see app.module.ts's
 * long-standing comment and every content module's "there is deliberately
 * no public read endpoint here" controller doc). Reads content directly
 * via its own repositories rather than through the admin services
 * (HeroService, NewsService, ...): those services' `findAll`/`findOne`
 * are shaped for admin CRUD (draft+published, single-id lookup), not for
 * the public site's status+publishAt gating, slug lookups, or
 * cross-entity resolution (menu item -> page, mediaId -> url) this
 * layer needs. SiteSettingsService and SitemapService are the two
 * exceptions — reused directly rather than re-read through a
 * repository: SiteSettingsService already exposes exactly the
 * singleton-row read this layer needs, and SitemapService's entries
 * are assembled by each content module's own provider (registered in
 * its onModuleInit), not by anything this layer would otherwise query.
 *
 * No WebsiteAuthModule import: every route here is intentionally
 * unauthenticated (see main.ts's CORS comment). Each controller carries
 * its own dedicated rate limit and Cache-Control header — see
 * common/public-rate-limit.constants.ts — rather than anything
 * configured at this module level. Read-through Redis caching (see
 * common/public-cache.constants.ts and core/redis/redis.service.ts) is
 * likewise handled per-controller, not here — RedisModule is imported
 * so every controller in this module can inject RedisService.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      HeroSlide,
      AboutPage,
      Feature,
      Statistic,
      CtaBanner,
      GalleryItem,
      NewsArticle,
      StaticPage,
      CalendarEvent,
      Campus,
      Teacher,
      Faq,
      Testimonial,
      Menu,
      MenuItem,
      PortalLink,
      Media,
    ]),
    SiteModule,
    SeoModule,
    RedisModule,
    SiteSettingsModule,
  ],
  providers: [PublicVisibilityService, PublicMediaService],
  controllers: [
    PublicSitemapController,
    PublicHeroController,
    PublicAboutController,
    PublicFeaturesController,
    PublicStatisticsController,
    PublicCtaController,
    PublicGalleryController,
    PublicNewsController,
    PublicPagesController,
    PublicEventsController,
    PublicCampusesController,
    PublicTeachersController,
    PublicFaqController,
    PublicTestimonialsController,
    PublicNavigationController,
    PublicSiteSettingsController,
    PublicPortalLinksController,
  ],
})
export class PublicApiModule {}

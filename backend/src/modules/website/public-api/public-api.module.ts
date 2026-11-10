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
import { Achievement } from '../content/achievements/entities/achievement.entity';
import { AcademicCalendarEntry } from '../content/academic-calendar/entities/academic-calendar-entry.entity';
import { AdmissionEntry } from '../content/admissions/entities/admission-entry.entity';
import { Testimonial } from '../content/testimonials/entities/testimonial.entity';
import { TrustBadge } from '../content/trust-badges/entities/trust-badge.entity';
import { Menu } from '../content/navigation/entities/menu.entity';
import { MenuItem } from '../content/navigation/entities/menu-item.entity';
import { PortalLink } from '../content/site-settings/entities/portal-link.entity';
import { Media } from '../core/media/entities/media.entity';
import { SiteModule } from '../core/site/site.module';
import { SeoModule } from '../core/seo/seo.module';
import { RedisModule } from '../core/redis/redis.module';
import { SiteSettingsModule } from '../content/site-settings/site-settings.module';
import { PreRegistrationsModule } from '../content/pre-registrations/pre-registrations.module';
import { NewsletterModule } from '../content/newsletter/newsletter.module';
import { CampusScopeModule } from '../content/common/campus-scope.module';
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
import { PublicAchievementsController } from './achievements/public-achievements.controller';
import { PublicAcademicCalendarController } from './academic-calendar/public-academic-calendar.controller';
import { PublicAdmissionsController } from './admissions/public-admissions.controller';
import { PublicTestimonialsController } from './testimonials/public-testimonials.controller';
import { PublicTrustBadgesController } from './trust-badges/public-trust-badges.controller';
import { PublicNavigationController } from './navigation/public-navigation.controller';
import {
  PublicSiteSettingsController,
  PublicPortalLinksController,
} from './site-settings/public-site-settings.controller';
import { PublicPreRegistrationController } from './pre-registration/public-pre-registration.controller';
import { PublicNewsletterController } from './newsletter/public-newsletter.controller';
import { PublicContactMessagesController } from './contact-messages/public-contact-messages.controller';
import { ContactMessagesModule } from '../content/contact-messages/contact-messages.module';

/**
 * Registers the public read API and public form-submission controllers.
 * Read controllers apply public visibility and resolve related media,
 * navigation, and SEO data; caching and rate limits are configured per
 * controller. Form submissions delegate to content services.
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
      Achievement,
      AcademicCalendarEntry,
      AdmissionEntry,
      Testimonial,
      TrustBadge,
      Menu,
      MenuItem,
      PortalLink,
      Media,
    ]),
    SiteModule,
    SeoModule,
    RedisModule,
    SiteSettingsModule,
    PreRegistrationsModule,
    NewsletterModule,
    ContactMessagesModule,
    CampusScopeModule,
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
    PublicAchievementsController,
    PublicAcademicCalendarController,
    PublicAdmissionsController,
    PublicTestimonialsController,
    PublicTrustBadgesController,
    PublicNavigationController,
    PublicSiteSettingsController,
    PublicPortalLinksController,
    PublicPreRegistrationController,
    PublicNewsletterController,
    PublicContactMessagesController,
  ],
})
export class PublicApiModule {}

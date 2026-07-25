import { Module } from '@nestjs/common';
import { CommonModule } from './core/common/common.module';
import { EventsModule } from './core/events/events.module';
import { SiteModule } from './core/site/site.module';
import { SeoModule } from './core/seo/seo.module';
import { RedisModule } from './core/redis/redis.module';
import { PublishingModule } from './core/publishing/publishing.module';
import { OrderingModule } from './core/ordering/ordering.module';
import { I18nModule } from './core/i18n/i18n.module';
import { MediaModule } from './core/media/media.module';
import { HealthModule } from './core/health/health.module';
import { RevisionsModule } from './core/revisions/revisions.module';
import { AuditLogModule } from './core/audit-log/audit-log.module';
import { WebsiteAuthModule } from './auth/auth.module';
import { AdminUsersModule } from './identity/admin-users/admin-users.module';
import { CmsAuthModule } from './identity/auth/cms-auth.module';
import { FaqModule } from './content/faq/faq.module';
import { TestimonialsModule } from './content/testimonials/testimonials.module';
import { HeroModule } from './content/hero/hero.module';
import { AboutModule } from './content/about/about.module';
import { FeaturesModule } from './content/features/features.module';
import { StatisticsModule } from './content/statistics/statistics.module';
import { CtaModule } from './content/cta/cta.module';
import { GalleryModule } from './content/gallery/gallery.module';
import { NewsModule } from './content/news/news.module';
import { PagesModule } from './content/pages/pages.module';
import { EventsModule as EventsContentModule } from './content/events/events.module';
import { CampusesModule } from './content/campuses/campuses.module';
import { TeachersModule } from './content/teachers/teachers.module';
import { NavigationModule } from './content/navigation/navigation.module';
import { SiteSettingsModule } from './content/site-settings/site-settings.module';
import { PreRegistrationsModule } from './content/pre-registrations/pre-registrations.module';
import { PublicApiModule } from './public-api/public-api.module';

/**
 * Composition root — imports every kernel module (and, from Phase 2
 * onward, every content module) so they're registered exactly once in
 * the DI graph. Exports nothing further: this is the top of the tree,
 * not a pass-through / barrel. Content modules import only the specific
 * kernel modules they actually use, declared in their own `imports`.
 */
@Module({
  imports: [
    CommonModule,
    EventsModule,
    SiteModule,
    SeoModule,
    RedisModule,
    PublishingModule,
    OrderingModule,
    I18nModule,
    MediaModule,
    HealthModule,
    RevisionsModule,
    AuditLogModule,
    WebsiteAuthModule,
    AdminUsersModule,
    CmsAuthModule,
    FaqModule,
    TestimonialsModule,
    HeroModule,
    AboutModule,
    FeaturesModule,
    StatisticsModule,
    CtaModule,
    GalleryModule,
    NewsModule,
    PagesModule,
    EventsContentModule,
    CampusesModule,
    TeachersModule,
    NavigationModule,
    SiteSettingsModule,
    PreRegistrationsModule,
    PublicApiModule,
    // Phase 2+ remaining: Achievements, ...
  ],
})
export class WebsiteModule {}

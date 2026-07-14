import { Module } from '@nestjs/common';
import { CommonModule } from './core/common/common.module';
import { EventsModule } from './core/events/events.module';
import { SiteModule } from './core/site/site.module';
import { SeoModule } from './core/seo/seo.module';
import { PublishingModule } from './core/publishing/publishing.module';
import { OrderingModule } from './core/ordering/ordering.module';
import { I18nModule } from './core/i18n/i18n.module';
import { MediaModule } from './core/media/media.module';
import { RevisionsModule } from './core/revisions/revisions.module';
import { WebsiteAuthModule } from './auth/auth.module';
import { FaqModule } from './content/faq/faq.module';
import { TestimonialsModule } from './content/testimonials/testimonials.module';
import { HeroModule } from './content/hero/hero.module';
import { AboutModule } from './content/about/about.module';
import { FeaturesModule } from './content/features/features.module';
import { GalleryModule } from './content/gallery/gallery.module';
import { NewsModule } from './content/news/news.module';
import { PagesModule } from './content/pages/pages.module';
import { NavigationModule } from './content/navigation/navigation.module';
import { SiteSettingsModule } from './content/site-settings/site-settings.module';
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
    PublishingModule,
    OrderingModule,
    I18nModule,
    MediaModule,
    RevisionsModule,
    WebsiteAuthModule,
    FaqModule,
    TestimonialsModule,
    HeroModule,
    AboutModule,
    FeaturesModule,
    GalleryModule,
    NewsModule,
    PagesModule,
    NavigationModule,
    SiteSettingsModule,
    PublicApiModule,
    // Phase 2+ remaining: CampusesModule,
    // StatsModule, AchievementsModule, CtaBannersModule, ...
  ],
})
export class WebsiteModule {}

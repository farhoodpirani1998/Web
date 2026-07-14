import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HeroSlide } from '../content/hero/entities/hero-slide.entity';
import { AboutPage } from '../content/about/entities/about.entity';
import { Feature } from '../content/features/entities/feature.entity';
import { GalleryItem } from '../content/gallery/entities/gallery-item.entity';
import { NewsArticle } from '../content/news/entities/news-article.entity';
import { StaticPage } from '../content/pages/entities/page.entity';
import { Faq } from '../content/faq/entities/faq.entity';
import { Testimonial } from '../content/testimonials/entities/testimonial.entity';
import { Menu } from '../content/navigation/entities/menu.entity';
import { MenuItem } from '../content/navigation/entities/menu-item.entity';
import { PortalLink } from '../content/site-settings/entities/portal-link.entity';
import { Media } from '../core/media/entities/media.entity';
import { SiteModule } from '../core/site/site.module';
import { SiteSettingsModule } from '../content/site-settings/site-settings.module';
import { PublicVisibilityService } from './common/public-visibility.service';
import { PublicMediaService } from './common/public-media.service';
import { PublicHeroController } from './hero/public-hero.controller';
import { PublicAboutController } from './about/public-about.controller';
import { PublicFeaturesController } from './features/public-features.controller';
import { PublicGalleryController } from './gallery/public-gallery.controller';
import { PublicNewsController } from './news/public-news.controller';
import { PublicPagesController } from './pages/public-pages.controller';
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
 * layer needs. SiteSettingsService is the one exception — reused
 * directly for feature-flag/general-settings reads, since it already
 * exposes exactly the singleton-row read this layer needs with no
 * admin-only shaping to work around.
 *
 * No WebsiteAuthModule import: every route here is intentionally
 * unauthenticated (see main.ts's CORS comment). No rate limiting yet —
 * deferred past this phase.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([
      HeroSlide,
      AboutPage,
      Feature,
      GalleryItem,
      NewsArticle,
      StaticPage,
      Faq,
      Testimonial,
      Menu,
      MenuItem,
      PortalLink,
      Media,
    ]),
    SiteModule,
    SiteSettingsModule,
  ],
  providers: [PublicVisibilityService, PublicMediaService],
  controllers: [
    PublicHeroController,
    PublicAboutController,
    PublicFeaturesController,
    PublicGalleryController,
    PublicNewsController,
    PublicPagesController,
    PublicFaqController,
    PublicTestimonialsController,
    PublicNavigationController,
    PublicSiteSettingsController,
    PublicPortalLinksController,
  ],
})
export class PublicApiModule {}

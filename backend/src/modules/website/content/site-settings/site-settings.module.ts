import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteSettings } from './entities/site-settings.entity';
import { PortalLink } from './entities/portal-link.entity';
import { SiteSettingsService } from './site-settings.service';
import { SiteSettingsController } from './site-settings.controller';
import { PortalLinksService } from './portal-links.service';
import { PortalLinksController } from './portal-links.controller';
import { SiteModule } from '../../core/site/site.module';
import { MediaModule } from '../../core/media/media.module';
import { OrderingModule } from '../../core/ordering/ordering.module';
import { EventsModule } from '../../core/events/events.module';
import { WebsiteAuthModule } from '../../auth/auth.module';

/**
 * Bundles Site Settings (General/Contact/Social/SEO/Feature Flags) and
 * Portal Links into one module — they're one admin-facing feature even
 * though Portal Links is its own table (see PortalLink entity doc).
 *
 * Imports only the kernel pieces actually used: site scoping, media
 * (logo/favicon references), ordering (Portal Links position), and
 * events (both services emit SETTINGS_UPDATED directly via
 * EventEmitter2 — same reasoning MediaModule/PublishingModule already
 * establish for importing EventsModule explicitly rather than relying
 * on it being global). No PublishingModule and no RevisionsModule —
 * neither section has a draft/published lifecycle or revision
 * history, see SiteSettings entity doc. No SeoModule import: the SEO
 * section reuses the shared `SeoMetadata` embeddable/`SeoMetadataDto`
 * directly, and — unlike About/Hero — never registers with
 * SitemapService, so SeoService/SitemapService are never actually
 * called here.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([SiteSettings, PortalLink]),
    SiteModule,
    MediaModule,
    OrderingModule,
    EventsModule,
    WebsiteAuthModule,
  ],
  providers: [SiteSettingsService, PortalLinksService],
  controllers: [SiteSettingsController, PortalLinksController],
  exports: [SiteSettingsService, PortalLinksService],
})
export class SiteSettingsModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarEvent } from './entities/calendar-event.entity';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { SiteModule } from '../../core/site/site.module';
import { PublishingModule } from '../../core/publishing/publishing.module';
import { MediaModule } from '../../core/media/media.module';
import { SeoModule } from '../../core/seo/seo.module';
import { RevisionsModule } from '../../core/revisions/revisions.module';
import { SiteSettingsModule } from '../site-settings/site-settings.module';
import { WebsiteAuthModule } from '../../auth/auth.module';

/**
 * Kernel pieces used: site scoping, publishing, media (featured image
 * reference), seo (SeoMetadata embeddable + SitemapService — an Event
 * IS its own public page), revisions (a News/Pages-shaped long-form
 * content type), site-settings (read-only, to gate the sitemap
 * provider on `featureFlags.eventsEnabled` — see EventsService.
 * onModuleInit), and auth. No OrderingModule — see the entity comment
 * for why events don't use manual `position` ordering.
 *
 * Named `EventsModule` for consistency with every other content
 * module's `<Domain>Module` naming (NewsModule, PagesModule, ...) —
 * callers importing both this and core/events' `EventsModule` (the
 * unrelated domain-event-emitter wrapper) should alias one of the two
 * imports, same as WebsiteModule/SiteSettingsModule already do.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([CalendarEvent]),
    SiteModule,
    PublishingModule,
    MediaModule,
    SeoModule,
    RevisionsModule,
    SiteSettingsModule,
    WebsiteAuthModule,
  ],
  providers: [EventsService],
  controllers: [EventsController],
  exports: [EventsService],
})
export class EventsModule {}

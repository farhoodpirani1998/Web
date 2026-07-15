import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsArticle } from './entities/news-article.entity';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { SiteModule } from '../../core/site/site.module';
import { PublishingModule } from '../../core/publishing/publishing.module';
import { MediaModule } from '../../core/media/media.module';
import { SeoModule } from '../../core/seo/seo.module';
import { RevisionsModule } from '../../core/revisions/revisions.module';
import { SiteSettingsModule } from '../site-settings/site-settings.module';
import { WebsiteAuthModule } from '../../auth/auth.module';

/**
 * Kernel pieces used: site scoping, publishing, media (featured image
 * reference), seo (SeoMetadata embeddable + SitemapService — News IS
 * its own public page per article), revisions (one of the 4 revision-
 * enabled types), site-settings (read-only, to gate the sitemap
 * provider on `featureFlags.newsEnabled` — see NewsService.
 * onModuleInit, same as EventsModule), and auth. No OrderingModule —
 * see the entity comment for why a news feed doesn't use manual
 * `position` ordering.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([NewsArticle]),
    SiteModule,
    PublishingModule,
    MediaModule,
    SeoModule,
    RevisionsModule,
    SiteSettingsModule,
    WebsiteAuthModule,
  ],
  providers: [NewsService],
  controllers: [NewsController],
  exports: [NewsService],
})
export class NewsModule {}

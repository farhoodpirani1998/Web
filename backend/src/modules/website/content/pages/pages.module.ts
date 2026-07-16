import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaticPage } from './entities/page.entity';
import { PagesService } from './pages.service';
import { PagesController } from './pages.controller';
import { SiteModule } from '../../core/site/site.module';
import { PublishingModule } from '../../core/publishing/publishing.module';
import { MediaModule } from '../../core/media/media.module';
import { SeoModule } from '../../core/seo/seo.module';
import { RedisModule } from '../../core/redis/redis.module';
import { RevisionsModule } from '../../core/revisions/revisions.module';
import { WebsiteAuthModule } from '../../auth/auth.module';

/**
 * Kernel pieces used: site scoping, publishing, media (featured image
 * reference), seo (SeoMetadata embeddable + SitemapService — a Page IS
 * its own public page), revisions (one of the 4 revision-enabled
 * types), and auth. No OrderingModule — see the entity comment for why
 * pages don't use manual `position` ordering.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([StaticPage]),
    SiteModule,
    PublishingModule,
    MediaModule,
    SeoModule,
    RevisionsModule,
    RedisModule,
    WebsiteAuthModule,
  ],
  providers: [PagesService],
  controllers: [PagesController],
  exports: [PagesService],
})
export class PagesModule {}

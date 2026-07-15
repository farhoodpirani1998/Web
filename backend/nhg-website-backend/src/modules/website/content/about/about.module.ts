import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AboutPage } from './entities/about.entity';
import { AboutService } from './about.service';
import { AboutController } from './about.controller';
import { SiteModule } from '../../core/site/site.module';
import { PublishingModule } from '../../core/publishing/publishing.module';
import { MediaModule } from '../../core/media/media.module';
import { SeoModule } from '../../core/seo/seo.module';
import { RevisionsModule } from '../../core/revisions/revisions.module';
import { WebsiteAuthModule } from '../../auth/auth.module';

/**
 * Kernel pieces used: site scoping, publishing, media (page image
 * reference), seo (SeoMetadata embeddable + SitemapService — About IS
 * its own public page), revisions (one of the 4 revision-enabled
 * types), and auth. No ordering — About is a singleton, nothing to
 * reorder.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([AboutPage]),
    SiteModule,
    PublishingModule,
    MediaModule,
    SeoModule,
    RevisionsModule,
    WebsiteAuthModule,
  ],
  providers: [AboutService],
  controllers: [AboutController],
  exports: [AboutService],
})
export class AboutModule {}

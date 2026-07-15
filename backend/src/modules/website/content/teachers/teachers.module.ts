import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Teacher } from './entities/teacher.entity';
import { TeachersService } from './teachers.service';
import { TeachersController } from './teachers.controller';
import { SiteModule } from '../../core/site/site.module';
import { OrderingModule } from '../../core/ordering/ordering.module';
import { PublishingModule } from '../../core/publishing/publishing.module';
import { MediaModule } from '../../core/media/media.module';
import { SeoModule } from '../../core/seo/seo.module';
import { RevisionsModule } from '../../core/revisions/revisions.module';
import { WebsiteAuthModule } from '../../auth/auth.module';

/**
 * Kernel pieces used: site scoping, ordering (drag-and-drop `position`
 * — see the entity's doc comment for why teachers are manually
 * ordered), publishing, media (avatar reference), seo (SeoMetadata
 * embeddable + SitemapService — a Teacher profile IS its own public
 * page), revisions (a Campus/News/Events/Pages-shaped content type),
 * and auth. No SiteSettingsModule — same as Campuses, Teachers is not
 * feature-flag gated (see the entity's doc comment), so there is
 * nothing here that needs to read SiteSettings.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Teacher]),
    SiteModule,
    OrderingModule,
    PublishingModule,
    MediaModule,
    SeoModule,
    RevisionsModule,
    WebsiteAuthModule,
  ],
  providers: [TeachersService],
  controllers: [TeachersController],
  exports: [TeachersService],
})
export class TeachersModule {}

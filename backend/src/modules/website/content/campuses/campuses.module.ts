import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Campus } from './entities/campus.entity';
import { CampusesService } from './campuses.service';
import { CampusesController } from './campuses.controller';
import { SiteModule } from '../../core/site/site.module';
import { OrderingModule } from '../../core/ordering/ordering.module';
import { PublishingModule } from '../../core/publishing/publishing.module';
import { MediaModule } from '../../core/media/media.module';
import { SeoModule } from '../../core/seo/seo.module';
import { RedisModule } from '../../core/redis/redis.module';
import { RevisionsModule } from '../../core/revisions/revisions.module';
import { WebsiteAuthModule } from '../../auth/auth.module';

/**
 * Kernel pieces used: site scoping, ordering (drag-and-drop `position`
 * — see the entity's doc comment for why campuses are manually
 * ordered), publishing, media (featured image reference), seo
 * (SeoMetadata embeddable + SitemapService — a Campus IS its own
 * public page), revisions (a News/Events/Pages-shaped content type),
 * and auth. No SiteSettingsModule — unlike EventsModule, Campuses is
 * not feature-flag gated (see the entity's doc comment), so there is
 * nothing here that needs to read SiteSettings.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Campus]),
    SiteModule,
    OrderingModule,
    PublishingModule,
    MediaModule,
    SeoModule,
    RevisionsModule,
    RedisModule,
    WebsiteAuthModule,
  ],
  providers: [CampusesService],
  controllers: [CampusesController],
  exports: [CampusesService],
})
export class CampusesModule {}

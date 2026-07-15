import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Statistic } from './entities/statistic.entity';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { SiteModule } from '../../core/site/site.module';
import { OrderingModule } from '../../core/ordering/ordering.module';
import { PublishingModule } from '../../core/publishing/publishing.module';
import { WebsiteAuthModule } from '../../auth/auth.module';

/**
 * Imports only the kernel pieces it actually uses: site scoping,
 * ordering (drag-and-drop position), publishing (draft/published/
 * archived), and auth (permission-gated admin routes). No revisions,
 * no media, no seo — same reasoning as FeaturesModule/FaqModule:
 * every field is short and trivial to retype (no long-form prose worth
 * diffing/restoring), `icon` is a plain string design token rather than
 * a Media reference, and a stat counter isn't its own indexable public
 * page.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Statistic]),
    SiteModule,
    OrderingModule,
    PublishingModule,
    WebsiteAuthModule,
  ],
  providers: [StatisticsService],
  controllers: [StatisticsController],
  exports: [StatisticsService],
})
export class StatisticsModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Achievement } from './entities/achievement.entity';
import { AchievementsService } from './achievements.service';
import { AchievementsController } from './achievements.controller';
import { SiteModule } from '../../core/site/site.module';
import { OrderingModule } from '../../core/ordering/ordering.module';
import { PublishingModule } from '../../core/publishing/publishing.module';
import { CmsAuthModule } from '../../identity/auth/cms-auth.module';
import { RedisModule } from '../../core/redis/redis.module';

/**
 * Imports only the kernel pieces it uses: site scoping, ordering
 * (drag-and-drop position), publishing (draft/published/archived), and
 * auth (permission-gated admin routes). No revisions, media, or seo —
 * the Achievements band has none of that surface area.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Achievement]),
    SiteModule,
    OrderingModule,
    PublishingModule,
    CmsAuthModule,
    RedisModule,
  ],
  providers: [AchievementsService],
  controllers: [AchievementsController],
  exports: [AchievementsService],
})
export class AchievementsModule {}

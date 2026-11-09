import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrustBadge } from './entities/trust-badge.entity';
import { TrustBadgesService } from './trust-badges.service';
import { TrustBadgesController } from './trust-badges.controller';
import { SiteModule } from '../../core/site/site.module';
import { OrderingModule } from '../../core/ordering/ordering.module';
import { PublishingModule } from '../../core/publishing/publishing.module';
import { MediaModule } from '../../core/media/media.module';
import { CmsAuthModule } from '../../identity/auth/cms-auth.module';
import { RedisModule } from '../../core/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TrustBadge]),
    SiteModule,
    OrderingModule,
    PublishingModule,
    MediaModule,
    CmsAuthModule,
    RedisModule,
  ],
  providers: [TrustBadgesService],
  controllers: [TrustBadgesController],
  exports: [TrustBadgesService],
})
export class TrustBadgesModule {}

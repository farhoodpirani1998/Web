import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HeroSlide } from './entities/hero-slide.entity';
import { HeroService } from './hero.service';
import { HeroController } from './hero.controller';
import { SiteModule } from '../../core/site/site.module';
import { OrderingModule } from '../../core/ordering/ordering.module';
import { PublishingModule } from '../../core/publishing/publishing.module';
import { MediaModule } from '../../core/media/media.module';
import { RedisModule } from '../../core/redis/redis.module';
import { RevisionsModule } from '../../core/revisions/revisions.module';
import { WebsiteAuthModule } from '../../auth/auth.module';

/**
 * Kernel pieces used: site scoping, ordering (carousel position),
 * publishing, media (background image reference), revisions (hero is
 * one of the 4 revision-enabled types), and auth. No seo — a hero slide
 * isn't its own indexable page.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([HeroSlide]),
    SiteModule,
    OrderingModule,
    PublishingModule,
    MediaModule,
    RevisionsModule,
    RedisModule,
    WebsiteAuthModule,
  ],
  providers: [HeroService],
  controllers: [HeroController],
  exports: [HeroService],
})
export class HeroModule {}

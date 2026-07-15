import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feature } from './entities/feature.entity';
import { FeaturesService } from './features.service';
import { FeaturesController } from './features.controller';
import { SiteModule } from '../../core/site/site.module';
import { OrderingModule } from '../../core/ordering/ordering.module';
import { PublishingModule } from '../../core/publishing/publishing.module';
import { WebsiteAuthModule } from '../../auth/auth.module';

/**
 * Imports only the kernel pieces it actually uses: site scoping,
 * ordering (drag-and-drop position), publishing (draft/published/
 * archived), and auth (permission-gated admin routes). No revisions,
 * no media, no seo — same reasoning as FaqModule: `icon` is a plain
 * string design token, not a Media reference.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Feature]),
    SiteModule,
    OrderingModule,
    PublishingModule,
    WebsiteAuthModule,
  ],
  providers: [FeaturesService],
  controllers: [FeaturesController],
  exports: [FeaturesService],
})
export class FeaturesModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Faq } from './entities/faq.entity';
import { FaqService } from './faq.service';
import { FaqController } from './faq.controller';
import { SiteModule } from '../../core/site/site.module';
import { OrderingModule } from '../../core/ordering/ordering.module';
import { PublishingModule } from '../../core/publishing/publishing.module';
import { WebsiteAuthModule } from '../../auth/auth.module';

/**
 * Imports only the kernel pieces it actually uses: site scoping,
 * ordering (drag-and-drop position), publishing (draft/published/
 * archived), and auth (permission-gated admin routes). No revisions,
 * no media, no seo — FAQ has none of that surface area.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Faq]),
    SiteModule,
    OrderingModule,
    PublishingModule,
    WebsiteAuthModule,
  ],
  providers: [FaqService],
  controllers: [FaqController],
  exports: [FaqService],
})
export class FaqModule {}

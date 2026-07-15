import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CtaBanner } from './entities/cta.entity';
import { CtaService } from './cta.service';
import { CtaController } from './cta.controller';
import { SiteModule } from '../../core/site/site.module';
import { PublishingModule } from '../../core/publishing/publishing.module';
import { MediaModule } from '../../core/media/media.module';
import { WebsiteAuthModule } from '../../auth/auth.module';

/**
 * Kernel pieces used: site scoping, publishing (draft/published/
 * archived), media (background image reference), and auth. No
 * ordering — CTA is a singleton, nothing to reorder. No revisions, no
 * seo — see CtaBanner entity doc for why.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([CtaBanner]),
    SiteModule,
    PublishingModule,
    MediaModule,
    WebsiteAuthModule,
  ],
  providers: [CtaService],
  controllers: [CtaController],
  exports: [CtaService],
})
export class CtaModule {}

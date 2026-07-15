import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Testimonial } from './entities/testimonial.entity';
import { TestimonialsService } from './testimonials.service';
import { TestimonialsController } from './testimonials.controller';
import { SiteModule } from '../../core/site/site.module';
import { OrderingModule } from '../../core/ordering/ordering.module';
import { PublishingModule } from '../../core/publishing/publishing.module';
import { MediaModule } from '../../core/media/media.module';
import { WebsiteAuthModule } from '../../auth/auth.module';

/**
 * Kernel pieces used: site scoping, ordering, publishing, media
 * (avatar is a Media reference, tracked via MediaUsage), and auth.
 * No seo, no revisions — same reasoning as FaqModule.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Testimonial]),
    SiteModule,
    OrderingModule,
    PublishingModule,
    MediaModule,
    WebsiteAuthModule,
  ],
  providers: [TestimonialsService],
  controllers: [TestimonialsController],
  exports: [TestimonialsService],
})
export class TestimonialsModule {}

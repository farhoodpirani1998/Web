import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GalleryItem } from './entities/gallery-item.entity';
import { GalleryService } from './gallery.service';
import { GalleryController } from './gallery.controller';
import { SiteModule } from '../../core/site/site.module';
import { OrderingModule } from '../../core/ordering/ordering.module';
import { PublishingModule } from '../../core/publishing/publishing.module';
import { MediaModule } from '../../core/media/media.module';
import { WebsiteAuthModule } from '../../auth/auth.module';

/**
 * Kernel pieces used: site scoping, ordering, publishing, media (the
 * photo itself is a required Media reference, tracked via MediaUsage —
 * same convention as Testimonial's avatar), and auth. No seo, no
 * revisions — same reasoning as TestimonialsModule.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([GalleryItem]),
    SiteModule,
    OrderingModule,
    PublishingModule,
    MediaModule,
    WebsiteAuthModule,
  ],
  providers: [GalleryService],
  controllers: [GalleryController],
  exports: [GalleryService],
})
export class GalleryModule {}

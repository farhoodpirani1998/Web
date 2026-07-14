import { Module } from '@nestjs/common';
import { SeoService } from './seo.service';
import { SitemapService } from './sitemap.service';

@Module({
  providers: [SeoService, SitemapService],
  exports: [SeoService, SitemapService],
})
export class SeoModule {}

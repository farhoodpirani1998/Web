import { Controller, Get, Header } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { SitemapService } from '../../core/seo/sitemap.service';
import { buildSitemapXml } from '../../core/seo/sitemap-xml.util';
import {
  PUBLIC_THROTTLE,
  PUBLIC_CACHE_CONTROL,
} from '../common/public-rate-limit.constants';

/**
 * Renders /sitemap.xml from whatever providers content modules have
 * already registered with SitemapService — Pages, News, and About
 * today (see each service's onModuleInit). This controller does no
 * publish-status filtering itself: every provider already withholds
 * draft/archived/not-yet-published rows before its entries ever reach
 * SitemapService.generate() (same status+publishAt rule
 * PublicVisibilityService documents), so adding a new content type's
 * sitemap entries is still just that type registering its own
 * provider, unchanged from today.
 *
 * Deliberately mounted at the site root, not /public/sitemap.xml —
 * search engines and SEO tooling expect a literal /sitemap.xml path,
 * and main.ts sets no global prefix, so this is safe to add here.
 */
@Throttle(PUBLIC_THROTTLE)
@Header('Cache-Control', PUBLIC_CACHE_CONTROL)
@Header('Content-Type', 'application/xml')
@Controller()
export class PublicSitemapController {
  constructor(
    private readonly sitemap: SitemapService,
    private readonly config: ConfigService,
  ) {}

  @Get('sitemap.xml')
  async getSitemap(): Promise<string> {
    const entries = await this.sitemap.generate();
    const port = this.config.get<number>('PORT', 3100);
    const baseUrl = this.config.get<string>('PUBLIC_SITE_URL', `http://localhost:${port}`);
    return buildSitemapXml(entries, baseUrl);
  }
}

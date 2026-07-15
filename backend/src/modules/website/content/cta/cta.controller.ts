import { Body, Controller, Get, Patch } from '@nestjs/common';
import { CtaService } from './cta.service';
import { UpdateCtaDto } from './dto/update-cta.dto';
import { UpdateCtaStatusDto } from './dto/update-cta-status.dto';
import { RequireWebsitePermission } from '../../auth/website-permission.decorator';
import { WebsitePermission } from '../../auth/website-role.enum';

/**
 * Admin surface for the singleton CTA banner — no :id in the routes,
 * same reasoning as AboutController/SiteSettingsController (see
 * CtaService). Enabling/disabling the section entirely lives on
 * SiteSettingsController's feature-flags endpoint
 * (featureFlags.ctaEnabled), not here — same split every other
 * optional section (News/Gallery/Testimonials/Faq/Events) already
 * uses between its own content controller and Site Settings.
 */
@Controller('admin/cta')
export class CtaController {
  constructor(private readonly ctaService: CtaService) {}

  @Get()
  @RequireWebsitePermission(WebsitePermission.CONTENT_READ)
  get() {
    return this.ctaService.get();
  }

  @Patch()
  @RequireWebsitePermission(WebsitePermission.CONTENT_WRITE)
  update(@Body() dto: UpdateCtaDto) {
    return this.ctaService.update(dto);
  }

  @Patch('status')
  @RequireWebsitePermission(WebsitePermission.CONTENT_PUBLISH)
  updateStatus(@Body() dto: UpdateCtaStatusDto) {
    return this.ctaService.updateStatus(dto.status);
  }
}

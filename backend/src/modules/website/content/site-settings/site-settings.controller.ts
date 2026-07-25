import { Body, Controller, Get, Patch } from '@nestjs/common';
import { SiteSettingsService } from './site-settings.service';
import { UpdateGeneralSettingsDto } from './dto/update-general-settings.dto';
import { UpdateContactSettingsDto } from './dto/update-contact-settings.dto';
import { UpdateSocialLinksDto } from './dto/update-social-links.dto';
import { UpdateFeatureFlagsDto } from './dto/update-feature-flags.dto';
import { SeoMetadataDto } from '../common/dto/seo-metadata.dto';
import { RequireCmsPermission } from '../../identity/auth/cms-permission.decorator';
import { WebsitePermission } from '../../auth/website-role.enum';

/**
 * Admin surface for the singleton Site Settings — no :id in the
 * routes, same reasoning as AboutController. One PATCH endpoint per
 * section rather than a single PATCH that accepts the whole row: SEO
 * and Feature Flags are gated behind their own permissions
 * (SEO_MANAGE, FEATURE_FLAGS_MANAGE) distinct from general content
 * editing, so they can't share one endpoint's permission check.
 * Portal Links lives on its own controller — see PortalLinksController.
 */
@Controller('admin/site-settings')
export class SiteSettingsController {
  constructor(private readonly siteSettingsService: SiteSettingsService) {}

  @Get()
  @RequireCmsPermission(WebsitePermission.CONTENT_READ)
  get() {
    return this.siteSettingsService.get();
  }

  @Patch('general')
  @RequireCmsPermission(WebsitePermission.CONTENT_WRITE)
  updateGeneral(@Body() dto: UpdateGeneralSettingsDto) {
    return this.siteSettingsService.updateGeneral(dto);
  }

  @Patch('contact')
  @RequireCmsPermission(WebsitePermission.CONTENT_WRITE)
  updateContact(@Body() dto: UpdateContactSettingsDto) {
    return this.siteSettingsService.updateContact(dto);
  }

  @Patch('social')
  @RequireCmsPermission(WebsitePermission.CONTENT_WRITE)
  updateSocial(@Body() dto: UpdateSocialLinksDto) {
    return this.siteSettingsService.updateSocial(dto);
  }

  @Patch('seo')
  @RequireCmsPermission(WebsitePermission.SEO_MANAGE)
  updateSeo(@Body() dto: SeoMetadataDto) {
    return this.siteSettingsService.updateSeo(dto);
  }

  @Patch('feature-flags')
  @RequireCmsPermission(WebsitePermission.FEATURE_FLAGS_MANAGE)
  updateFeatureFlags(@Body() dto: UpdateFeatureFlagsDto) {
    return this.siteSettingsService.updateFeatureFlags(dto);
  }
}

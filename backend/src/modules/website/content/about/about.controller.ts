import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { AboutService } from './about.service';
import { UpdateAboutDto } from './dto/update-about.dto';
import { UpdateAboutStatusDto } from './dto/update-about-status.dto';
import { RequireCmsPermission } from '../../identity/auth/cms-permission.decorator';
import { WebsitePermission } from '../../auth/website-role.enum';
import { CurrentAdmin } from '../../identity/auth/current-admin.decorator';
import { CmsRequestUser } from '../../identity/auth/cms-jwt-payload.interface';

/**
 * Admin surface for the singleton About page — no :id in the routes,
 * since there is exactly one row per site (see AboutService). As with
 * every other content module here, the public read path belongs to the
 * public-api layer (Phase 3+), not this admin controller.
 */
@Controller('admin/about')
export class AboutController {
  constructor(private readonly aboutService: AboutService) {}

  @Get()
  @RequireCmsPermission(WebsitePermission.CONTENT_READ)
  get() {
    return this.aboutService.get();
  }

  @Get('revisions')
  @RequireCmsPermission(WebsitePermission.REVISIONS_VIEW)
  listRevisions() {
    return this.aboutService.listRevisions();
  }

  @Patch()
  @RequireCmsPermission(WebsitePermission.CONTENT_WRITE)
  update(@Body() dto: UpdateAboutDto, @CurrentAdmin() user: CmsRequestUser) {
    return this.aboutService.update(dto, user.id);
  }

  @Patch('status')
  @RequireCmsPermission(WebsitePermission.CONTENT_PUBLISH)
  updateStatus(@Body() dto: UpdateAboutStatusDto) {
    return this.aboutService.updateStatus(dto.status);
  }

  @Post('revisions/:versionNumber/restore')
  @RequireCmsPermission(WebsitePermission.REVISIONS_RESTORE)
  restoreRevision(
    @Param('versionNumber', ParseIntPipe) versionNumber: number,
    @CurrentAdmin() user: CmsRequestUser,
  ) {
    return this.aboutService.restoreRevision(versionNumber, user.id);
  }
}

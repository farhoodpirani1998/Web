import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { AboutService } from './about.service';
import { UpdateAboutDto } from './dto/update-about.dto';
import { UpdateAboutStatusDto } from './dto/update-about-status.dto';
import { RequireWebsitePermission } from '../../auth/website-permission.decorator';
import { WebsitePermission } from '../../auth/website-role.enum';
import { CurrentWebsiteUser, WebsiteRequestUser } from '../../auth/current-website-user.decorator';

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
  @RequireWebsitePermission(WebsitePermission.CONTENT_READ)
  get() {
    return this.aboutService.get();
  }

  @Get('revisions')
  @RequireWebsitePermission(WebsitePermission.REVISIONS_VIEW)
  listRevisions() {
    return this.aboutService.listRevisions();
  }

  @Patch()
  @RequireWebsitePermission(WebsitePermission.CONTENT_WRITE)
  update(@Body() dto: UpdateAboutDto, @CurrentWebsiteUser() user: WebsiteRequestUser) {
    return this.aboutService.update(dto, user.externalUserId);
  }

  @Patch('status')
  @RequireWebsitePermission(WebsitePermission.CONTENT_PUBLISH)
  updateStatus(@Body() dto: UpdateAboutStatusDto) {
    return this.aboutService.updateStatus(dto.status);
  }

  @Post('revisions/:versionNumber/restore')
  @RequireWebsitePermission(WebsitePermission.REVISIONS_RESTORE)
  restoreRevision(
    @Param('versionNumber', ParseIntPipe) versionNumber: number,
    @CurrentWebsiteUser() user: WebsiteRequestUser,
  ) {
    return this.aboutService.restoreRevision(versionNumber, user.externalUserId);
  }
}

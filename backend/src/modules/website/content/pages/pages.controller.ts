import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { UpdatePageStatusDto } from './dto/update-page-status.dto';
import { SchedulePageDto } from './dto/schedule-page.dto';
import { SetPageHomepageDto } from './dto/set-page-homepage.dto';
import { RequireCmsPermission } from '../../identity/auth/cms-permission.decorator';
import { WebsitePermission } from '../../auth/website-role.enum';
import { CurrentAdmin } from '../../identity/auth/current-admin.decorator';
import { CmsRequestUser } from '../../identity/auth/cms-jwt-payload.interface';
import { PublishStatus } from '../../core/publishing/publish-status.enum';

/**
 * Admin CRUD for generic content pages. As with every other content
 * module here, the public, unauthenticated read path (`/public/website/pages`,
 * individual `/pages/:slug` pages) belongs to the public-api layer
 * (Phase 3+), not this admin controller.
 */
@Controller('admin/pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get()
  @RequireCmsPermission(WebsitePermission.CONTENT_READ)
  findAll(@Query('status') status?: PublishStatus, @Query('parentId') parentId?: string) {
    return this.pagesService.findAll(status, parentId);
  }

  @Get(':id')
  @RequireCmsPermission(WebsitePermission.CONTENT_READ)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.pagesService.findOne(id);
  }

  @Get(':id/revisions')
  @RequireCmsPermission(WebsitePermission.REVISIONS_VIEW)
  listRevisions(@Param('id', ParseUUIDPipe) id: string) {
    return this.pagesService.listRevisions(id);
  }

  @Post()
  @RequireCmsPermission(WebsitePermission.CONTENT_WRITE)
  create(
    @Body() dto: CreatePageDto,
    @CurrentAdmin() user: CmsRequestUser,
  ) {
    return this.pagesService.create(dto, user.id);
  }

  @Patch(':id')
  @RequireCmsPermission(WebsitePermission.CONTENT_WRITE)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePageDto,
    @CurrentAdmin() user: CmsRequestUser,
  ) {
    return this.pagesService.update(id, dto, user.id);
  }

  @Patch(':id/status')
  @RequireCmsPermission(WebsitePermission.CONTENT_PUBLISH)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePageStatusDto,
  ) {
    return this.pagesService.updateStatus(id, dto.status);
  }

  // Distinct from `status`, identical idiom to News: gates when a
  // PUBLISHED page actually becomes visible (sitemap today; public API
  // in Phase 3+). Gated by the same permission as status/homepage
  // changes — a publishing decision, not a content-editing one.
  @Patch(':id/schedule')
  @RequireCmsPermission(WebsitePermission.CONTENT_PUBLISH)
  schedule(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SchedulePageDto,
  ) {
    return this.pagesService.schedule(id, dto.publishAt);
  }

  // Designating the site's homepage is a site-structure/publishing
  // decision (which live page serves `/`), not a plain content edit —
  // gated the same as status/schedule.
  @Patch(':id/homepage')
  @RequireCmsPermission(WebsitePermission.CONTENT_PUBLISH)
  setHomepage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SetPageHomepageDto,
  ) {
    return this.pagesService.setHomepage(id, dto.isHomepage);
  }

  @Post(':id/revisions/:versionNumber/restore')
  @RequireCmsPermission(WebsitePermission.REVISIONS_RESTORE)
  restoreRevision(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('versionNumber', ParseIntPipe) versionNumber: number,
    @CurrentAdmin() user: CmsRequestUser,
  ) {
    return this.pagesService.restoreRevision(id, versionNumber, user.id);
  }

  @Delete(':id')
  @RequireCmsPermission(WebsitePermission.CONTENT_WRITE)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.pagesService.remove(id);
  }
}

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
import { CampusesService } from './campuses.service';
import { CreateCampusDto } from './dto/create-campus.dto';
import { UpdateCampusDto } from './dto/update-campus.dto';
import { UpdateCampusStatusDto } from './dto/update-campus-status.dto';
import { ScheduleCampusDto } from './dto/schedule-campus.dto';
import { ReorderCampusesDto } from './dto/reorder-campuses.dto';
import { RequireWebsitePermission } from '../../auth/website-permission.decorator';
import { WebsitePermission } from '../../auth/website-role.enum';
import { CurrentWebsiteUser, WebsiteRequestUser } from '../../auth/current-website-user.decorator';
import { PublishStatus } from '../../core/publishing/publish-status.enum';

/**
 * Admin CRUD for campuses. As with every other content module here,
 * the public, unauthenticated read path (`/public/campuses`,
 * individual `/campuses/:slug` pages) belongs to the public-api layer,
 * not this admin controller.
 *
 * `reorder` is registered before the `:id` routes for the same reason
 * FeaturesController does — otherwise Nest would try to parse the
 * literal segment "reorder" as a `:id` UUID.
 */
@Controller('admin/campuses')
export class CampusesController {
  constructor(private readonly campusesService: CampusesService) {}

  @Get()
  @RequireWebsitePermission(WebsitePermission.CONTENT_READ)
  findAll(@Query('status') status?: PublishStatus) {
    return this.campusesService.findAll(status);
  }

  @Get(':id')
  @RequireWebsitePermission(WebsitePermission.CONTENT_READ)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.campusesService.findOne(id);
  }

  @Get(':id/revisions')
  @RequireWebsitePermission(WebsitePermission.REVISIONS_VIEW)
  listRevisions(@Param('id', ParseUUIDPipe) id: string) {
    return this.campusesService.listRevisions(id);
  }

  @Post()
  @RequireWebsitePermission(WebsitePermission.CONTENT_WRITE)
  create(
    @Body() dto: CreateCampusDto,
    @CurrentWebsiteUser() user: WebsiteRequestUser,
  ) {
    return this.campusesService.create(dto, user.externalUserId);
  }

  @Patch('reorder')
  @RequireWebsitePermission(WebsitePermission.CONTENT_WRITE)
  reorder(@Body() dto: ReorderCampusesDto) {
    return this.campusesService.reorder(dto.orderedIds);
  }

  @Patch(':id')
  @RequireWebsitePermission(WebsitePermission.CONTENT_WRITE)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCampusDto,
    @CurrentWebsiteUser() user: WebsiteRequestUser,
  ) {
    return this.campusesService.update(id, dto, user.externalUserId);
  }

  @Patch(':id/status')
  @RequireWebsitePermission(WebsitePermission.CONTENT_PUBLISH)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCampusStatusDto,
  ) {
    return this.campusesService.updateStatus(id, dto.status);
  }

  // Distinct from `status`, identical idiom to News/Events/Pages: gates
  // when a PUBLISHED campus's page actually becomes visible (sitemap
  // today; public API too — see PublicCampusesController).
  @Patch(':id/schedule')
  @RequireWebsitePermission(WebsitePermission.CONTENT_PUBLISH)
  schedule(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ScheduleCampusDto,
  ) {
    return this.campusesService.schedule(id, dto.publishAt);
  }

  @Post(':id/revisions/:versionNumber/restore')
  @RequireWebsitePermission(WebsitePermission.REVISIONS_RESTORE)
  restoreRevision(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('versionNumber', ParseIntPipe) versionNumber: number,
    @CurrentWebsiteUser() user: WebsiteRequestUser,
  ) {
    return this.campusesService.restoreRevision(id, versionNumber, user.externalUserId);
  }

  @Delete(':id')
  @RequireWebsitePermission(WebsitePermission.CONTENT_WRITE)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.campusesService.remove(id);
  }
}

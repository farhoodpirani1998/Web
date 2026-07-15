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
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { UpdateTeacherStatusDto } from './dto/update-teacher-status.dto';
import { ScheduleTeacherDto } from './dto/schedule-teacher.dto';
import { ReorderTeachersDto } from './dto/reorder-teachers.dto';
import { RequireWebsitePermission } from '../../auth/website-permission.decorator';
import { WebsitePermission } from '../../auth/website-role.enum';
import { CurrentWebsiteUser, WebsiteRequestUser } from '../../auth/current-website-user.decorator';
import { PublishStatus } from '../../core/publishing/publish-status.enum';

/**
 * Admin CRUD for teachers. As with every other content module here,
 * the public, unauthenticated read path (`/public/teachers`,
 * individual `/teachers/:slug` pages) belongs to the public-api layer,
 * not this admin controller.
 *
 * `reorder` is registered before the `:id` routes for the same reason
 * CampusesController does — otherwise Nest would try to parse the
 * literal segment "reorder" as a `:id` UUID.
 */
@Controller('admin/teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Get()
  @RequireWebsitePermission(WebsitePermission.CONTENT_READ)
  findAll(@Query('status') status?: PublishStatus) {
    return this.teachersService.findAll(status);
  }

  @Get(':id')
  @RequireWebsitePermission(WebsitePermission.CONTENT_READ)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.teachersService.findOne(id);
  }

  @Get(':id/revisions')
  @RequireWebsitePermission(WebsitePermission.REVISIONS_VIEW)
  listRevisions(@Param('id', ParseUUIDPipe) id: string) {
    return this.teachersService.listRevisions(id);
  }

  @Post()
  @RequireWebsitePermission(WebsitePermission.CONTENT_WRITE)
  create(
    @Body() dto: CreateTeacherDto,
    @CurrentWebsiteUser() user: WebsiteRequestUser,
  ) {
    return this.teachersService.create(dto, user.externalUserId);
  }

  @Patch('reorder')
  @RequireWebsitePermission(WebsitePermission.CONTENT_WRITE)
  reorder(@Body() dto: ReorderTeachersDto) {
    return this.teachersService.reorder(dto.orderedIds);
  }

  @Patch(':id')
  @RequireWebsitePermission(WebsitePermission.CONTENT_WRITE)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTeacherDto,
    @CurrentWebsiteUser() user: WebsiteRequestUser,
  ) {
    return this.teachersService.update(id, dto, user.externalUserId);
  }

  @Patch(':id/status')
  @RequireWebsitePermission(WebsitePermission.CONTENT_PUBLISH)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTeacherStatusDto,
  ) {
    return this.teachersService.updateStatus(id, dto.status);
  }

  // Distinct from `status`, identical idiom to Campus/News/Events/Pages:
  // gates when a PUBLISHED teacher's page actually becomes visible
  // (sitemap today; public API too — see PublicTeachersController).
  @Patch(':id/schedule')
  @RequireWebsitePermission(WebsitePermission.CONTENT_PUBLISH)
  schedule(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ScheduleTeacherDto,
  ) {
    return this.teachersService.schedule(id, dto.publishAt);
  }

  @Post(':id/revisions/:versionNumber/restore')
  @RequireWebsitePermission(WebsitePermission.REVISIONS_RESTORE)
  restoreRevision(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('versionNumber', ParseIntPipe) versionNumber: number,
    @CurrentWebsiteUser() user: WebsiteRequestUser,
  ) {
    return this.teachersService.restoreRevision(id, versionNumber, user.externalUserId);
  }

  @Delete(':id')
  @RequireWebsitePermission(WebsitePermission.CONTENT_WRITE)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.teachersService.remove(id);
  }
}

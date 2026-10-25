import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AcademicCalendarService } from './academic-calendar.service';
import { CreateAcademicCalendarEntryDto } from './dto/create-academic-calendar-entry.dto';
import { UpdateAcademicCalendarEntryDto } from './dto/update-academic-calendar-entry.dto';
import { UpdateAcademicCalendarEntryStatusDto } from './dto/update-academic-calendar-entry-status.dto';
import { ReorderAcademicCalendarEntriesDto } from './dto/reorder-academic-calendar-entries.dto';
import { RequireCmsPermission } from '../../identity/auth/cms-permission.decorator';
import { WebsitePermission } from '../../auth/website-role.enum';
import { PublishStatus } from '../../core/publishing/publish-status.enum';
import { AcademicCalendarEntryKind } from './entities/academic-calendar-entry.entity';

/** Admin CRUD for the Academic Calendar entries. */
@Controller('admin/academic-calendar-entries')
export class AcademicCalendarController {
  constructor(
    private readonly academicCalendarService: AcademicCalendarService,
  ) {}

  @Get()
  @RequireCmsPermission(WebsitePermission.CONTENT_READ)
  findAll(
    @Query('status') status?: PublishStatus,
    @Query('kind') kind?: AcademicCalendarEntryKind,
  ) {
    return this.academicCalendarService.findAll(status, kind);
  }

  @Get(':id')
  @RequireCmsPermission(WebsitePermission.CONTENT_READ)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.academicCalendarService.findOne(id);
  }

  @Post()
  @RequireCmsPermission(WebsitePermission.CONTENT_WRITE)
  create(@Body() dto: CreateAcademicCalendarEntryDto) {
    return this.academicCalendarService.create(dto);
  }

  @Patch('reorder')
  @RequireCmsPermission(WebsitePermission.CONTENT_WRITE)
  reorder(@Body() dto: ReorderAcademicCalendarEntriesDto) {
    return this.academicCalendarService.reorder(dto.orderedIds);
  }

  @Patch(':id')
  @RequireCmsPermission(WebsitePermission.CONTENT_WRITE)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAcademicCalendarEntryDto,
  ) {
    return this.academicCalendarService.update(id, dto);
  }

  @Patch(':id/status')
  @RequireCmsPermission(WebsitePermission.CONTENT_PUBLISH)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAcademicCalendarEntryStatusDto,
  ) {
    return this.academicCalendarService.updateStatus(id, dto.status);
  }

  @Delete(':id')
  @RequireCmsPermission(WebsitePermission.CONTENT_WRITE)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.academicCalendarService.remove(id);
  }
}

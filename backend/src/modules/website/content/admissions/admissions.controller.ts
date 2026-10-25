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
import { AdmissionsService } from './admissions.service';
import { CreateAdmissionEntryDto } from './dto/create-admission-entry.dto';
import { UpdateAdmissionEntryDto } from './dto/update-admission-entry.dto';
import { UpdateAdmissionEntryStatusDto } from './dto/update-admission-entry-status.dto';
import { ReorderAdmissionEntriesDto } from './dto/reorder-admission-entries.dto';
import { RequireCmsPermission } from '../../identity/auth/cms-permission.decorator';
import { WebsitePermission } from '../../auth/website-role.enum';
import { PublishStatus } from '../../core/publishing/publish-status.enum';
import { AdmissionEntryKind } from './entities/admission-entry.entity';

/** Admin CRUD for the Admissions entries. */
@Controller('admin/admission-entries')
export class AdmissionsController {
  constructor(private readonly admissionsService: AdmissionsService) {}

  @Get()
  @RequireCmsPermission(WebsitePermission.CONTENT_READ)
  findAll(
    @Query('status') status?: PublishStatus,
    @Query('kind') kind?: AdmissionEntryKind,
  ) {
    return this.admissionsService.findAll(status, kind);
  }

  @Get(':id')
  @RequireCmsPermission(WebsitePermission.CONTENT_READ)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.admissionsService.findOne(id);
  }

  @Post()
  @RequireCmsPermission(WebsitePermission.CONTENT_WRITE)
  create(@Body() dto: CreateAdmissionEntryDto) {
    return this.admissionsService.create(dto);
  }

  @Patch('reorder')
  @RequireCmsPermission(WebsitePermission.CONTENT_WRITE)
  reorder(@Body() dto: ReorderAdmissionEntriesDto) {
    return this.admissionsService.reorder(dto.orderedIds);
  }

  @Patch(':id')
  @RequireCmsPermission(WebsitePermission.CONTENT_WRITE)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAdmissionEntryDto,
  ) {
    return this.admissionsService.update(id, dto);
  }

  @Patch(':id/status')
  @RequireCmsPermission(WebsitePermission.CONTENT_PUBLISH)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAdmissionEntryStatusDto,
  ) {
    return this.admissionsService.updateStatus(id, dto.status);
  }

  @Delete(':id')
  @RequireCmsPermission(WebsitePermission.CONTENT_WRITE)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.admissionsService.remove(id);
  }
}

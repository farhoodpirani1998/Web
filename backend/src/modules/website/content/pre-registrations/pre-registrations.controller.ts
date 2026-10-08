import { Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Body, Query } from '@nestjs/common';
import { PreRegistrationsService } from './pre-registrations.service';
import { UpdatePreRegistrationStatusDto } from './dto/update-pre-registration-status.dto';
import { PreRegistrationStatus } from './entities/pre-registration-status.enum';
import { RequireCmsPermission } from '../../identity/auth/cms-permission.decorator';
import { WebsitePermission } from '../../auth/website-role.enum';

/**
 * Admin read/triage/delete for Pre-Registration submissions. No
 * `create`/`update` here — submissions only ever arrive via
 * `PublicPreRegistrationController` (`POST /public/pre-registration`);
 * this admin surface only lists, inspects, changes triage status, and
 * deletes them.
 *
 * `updateStatus` is gated on `CONTENT_WRITE`, not `CONTENT_PUBLISH`
 * (unlike `FaqController.updateStatus`) — this status is plain triage
 * state, not a governed publish transition, so it belongs to the same
 * permission as any other write here.
 */
@Controller('admin/pre-registrations')
export class PreRegistrationsController {
  constructor(private readonly preRegistrationsService: PreRegistrationsService) {}

  @Get()
  @RequireCmsPermission(WebsitePermission.CONTENT_READ)
  findAll(@Query('status') status?: PreRegistrationStatus) {
    return this.preRegistrationsService.findAll(status);
  }

  @Get(':id')
  @RequireCmsPermission(WebsitePermission.CONTENT_READ)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.preRegistrationsService.findOne(id);
  }

  @Patch(':id/status')
  @RequireCmsPermission(WebsitePermission.CONTENT_WRITE)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePreRegistrationStatusDto,
  ) {
    return this.preRegistrationsService.updateStatus(id, dto.status);
  }

  @Delete(':id')
  @RequireCmsPermission(WebsitePermission.CONTENT_WRITE)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.preRegistrationsService.remove(id);
  }
}

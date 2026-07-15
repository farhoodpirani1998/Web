import { Body, Controller, Delete, Get, NotFoundException, Param, Put } from '@nestjs/common';
import { RoleAssignmentsService } from './role-assignments.service';
import { AssignWebsiteRoleDto } from './dto/assign-website-role.dto';
import { RequireWebsiteSuperAdmin } from './require-website-super-admin.decorator';

/**
 * Admin management of `website_role_assignments` — who holds which
 * WebsiteRole. Every route here requires the caller to already be a
 * Super Admin, not merely a permission from ROLE_PERMISSIONS: role
 * management stays a step above the regular permission system so a
 * role can never be used to grant itself broader roles/permissions.
 */
@Controller('admin/role-assignments')
@RequireWebsiteSuperAdmin()
export class RoleAssignmentsController {
  constructor(private readonly roleAssignments: RoleAssignmentsService) {}

  @Get()
  findAll() {
    return this.roleAssignments.findAll();
  }

  @Get(':externalUserId')
  async findOne(@Param('externalUserId') externalUserId: string) {
    const assignment = await this.roleAssignments.findOne(externalUserId);
    if (!assignment) {
      throw new NotFoundException(`No role assigned to "${externalUserId}"`);
    }
    return assignment;
  }

  // PUT, not POST/PATCH: assigning a role is idempotent create-or-replace
  // on the (unique) externalUserId — same "assign" verb whether this is
  // the user's first role or a change of an existing one.
  @Put(':externalUserId')
  assign(@Param('externalUserId') externalUserId: string, @Body() dto: AssignWebsiteRoleDto) {
    return this.roleAssignments.assign(externalUserId, dto.role);
  }

  @Delete(':externalUserId')
  remove(@Param('externalUserId') externalUserId: string) {
    return this.roleAssignments.remove(externalUserId);
  }
}

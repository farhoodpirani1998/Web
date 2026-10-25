import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { AdminUsersService } from './admin-users.service';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { UpdateAdminUserDto } from './dto/update-admin-user.dto';
import { RequireCmsPermission } from '../auth/cms-permission.decorator';
import { WebsitePermission } from '../../auth/website-role.enum';
import { CurrentAdmin } from '../auth/current-admin.decorator';
import { CmsRequestUser } from '../auth/cms-jwt-payload.interface';

/**
 * Admin management. Gated behind `website.admins:manage` — held only by
 * SUPER_ADMIN (see ROLE_PERMISSIONS). A non-super-admin gets a 403 on
 * every route here, reads included: the admin roster (emails, roles) is
 * itself sensitive, so even listing requires the permission.
 *
 * `actorId` is threaded through the write handlers so the service can
 * refuse self-deactivation / self-deletion (see its doc comment).
 */
@Controller('admin/admin-users')
export class AdminUsersController {
  constructor(private readonly adminUsers: AdminUsersService) {}

  @Get()
  @RequireCmsPermission(WebsitePermission.ADMINS_MANAGE)
  findAll() {
    return this.adminUsers.findAll();
  }

  @Get(':id')
  @RequireCmsPermission(WebsitePermission.ADMINS_MANAGE)
  findOne(@Param('id') id: string) {
    return this.adminUsers.findOne(id);
  }

  @Post()
  @RequireCmsPermission(WebsitePermission.ADMINS_MANAGE)
  create(@Body() dto: CreateAdminUserDto) {
    return this.adminUsers.create(dto);
  }

  @Patch(':id')
  @RequireCmsPermission(WebsitePermission.ADMINS_MANAGE)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAdminUserDto,
    @CurrentAdmin() actor: CmsRequestUser,
  ) {
    return this.adminUsers.update(id, dto, actor.id);
  }

  @Delete(':id')
  @RequireCmsPermission(WebsitePermission.ADMINS_MANAGE)
  remove(@Param('id') id: string, @CurrentAdmin() actor: CmsRequestUser) {
    return this.adminUsers.remove(id, actor.id);
  }
}

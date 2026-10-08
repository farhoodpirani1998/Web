import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebsiteRoleAssignment } from './entities/website-role-assignment.entity';
import { WebsiteRole } from './website-role.enum';

/**
 * Runs AFTER WebsiteAuthGuard (which sets request.user). Deliberately
 * does NOT go through ROLE_PERMISSIONS the way WebsitePermissionGuard
 * does — role management must sit a level above the ordinary permission
 * table, otherwise a permission could be used to grant broader
 * permissions/roles than the role it came from. Only a caller whose own
 * WebsiteRoleAssignment.role is SUPER_ADMIN passes.
 */
@Injectable()
export class WebsiteSuperAdminGuard implements CanActivate {
  constructor(
    @InjectRepository(WebsiteRoleAssignment)
    private readonly roleRepo: Repository<WebsiteRoleAssignment>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const externalUserId: string | undefined = request.user?.externalUserId;
    if (!externalUserId) {
      throw new ForbiddenException('No verified identity on request');
    }

    const assignment = await this.roleRepo.findOne({ where: { externalUserId } });
    if (!assignment || assignment.role !== WebsiteRole.SUPER_ADMIN) {
      throw new ForbiddenException('Website Super Admin role required');
    }
    return true;
  }
}

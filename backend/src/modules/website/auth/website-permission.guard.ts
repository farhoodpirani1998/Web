import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebsiteRoleAssignment } from './entities/website-role-assignment.entity';
import { ROLE_PERMISSIONS, WebsitePermission } from './website-role.enum';
import { PERMISSION_KEY } from './website-permission.constants';

/**
 * Runs AFTER WebsiteAuthGuard (which sets request.user). Looks up the
 * verified identity's role in THIS backend's own table — never in SMS's
 * RBAC tables, which this backend does not have access to.
 */
@Injectable()
export class WebsitePermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(WebsiteRoleAssignment)
    private readonly roleRepo: Repository<WebsiteRoleAssignment>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.get<WebsitePermission>(
      PERMISSION_KEY,
      context.getHandler(),
    );
    if (!required) return true;

    const request = context.switchToHttp().getRequest();
    const externalUserId: string | undefined = request.user?.externalUserId;
    if (!externalUserId) {
      throw new ForbiddenException('No verified identity on request');
    }

    const assignment = await this.roleRepo.findOne({ where: { externalUserId } });
    if (!assignment) {
      throw new ForbiddenException('No website role assigned to this user');
    }

    const permissions = ROLE_PERMISSIONS[assignment.role] ?? [];
    if (!permissions.includes(required)) {
      throw new ForbiddenException(`Missing permission: ${required}`);
    }
    return true;
  }
}

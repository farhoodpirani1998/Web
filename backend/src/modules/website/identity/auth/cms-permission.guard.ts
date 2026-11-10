import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  ROLE_PERMISSIONS,
  WebsitePermission,
} from '../../auth/website-role.enum';
import { CMS_PERMISSION_KEY } from './cms-permission.constants';
import { CmsRequestUser } from './cms-jwt-payload.interface';

/**
 * Checks the acting identity's role against `ROLE_PERMISSIONS` for
 * the permission a route declares, using the CMS identity attached to
 * `request.user` by `CmsAuthGuard`.
 *
 * Must run after `CmsAuthGuard` — see `RequireCmsPermission`, which
 * always composes the two together so this is never accidentally used
 * on its own.
 *
 * No database lookup is needed here: `role` is already sitting on
 * `request.user`, taken directly from the verified
 * CMS JWT payload (`CmsAuthGuard`). This mirrors `CmsAuthGuard`'s own
 * documented stateless tradeoff — a role change/deactivation on
 * `CmsAdminUser` is only reflected once a new token is issued (login)
 * or the next `GET /admin/auth/me` call, not on every permission check.
 * `ROLE_PERMISSIONS` and `WebsitePermission` are reused as-is; CMS
 * authentication does not alter the permission model.
 */
@Injectable()
export class CmsPermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.get<WebsitePermission>(
      CMS_PERMISSION_KEY,
      context.getHandler(),
    );
    if (!required) return true;

    const request = context.switchToHttp().getRequest();
    const user: CmsRequestUser | undefined = request.user;
    if (!user) {
      throw new ForbiddenException('No verified identity on request');
    }

    const permissions = ROLE_PERMISSIONS[user.role] ?? [];
    if (!permissions.includes(required)) {
      throw new ForbiddenException(`Missing permission: ${required}`);
    }
    return true;
  }
}

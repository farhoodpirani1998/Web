import { SetMetadata, applyDecorators, UseGuards } from '@nestjs/common';
import { WebsitePermission } from '../../auth/website-role.enum';
import { CmsAuthGuard } from './cms-auth.guard';
import { CmsPermissionGuard } from './cms-permission.guard';
import { CMS_PERMISSION_KEY } from './cms-permission.constants';

/**
 * Composes `CmsAuthGuard` and `CmsPermissionGuard` to verify identity
 * and check the CMS-local permission model.
 *
 * Usage: `@RequireCmsPermission(WebsitePermission.CONTENT_WRITE)`
 */
export function RequireCmsPermission(permission: WebsitePermission) {
  return applyDecorators(
    SetMetadata(CMS_PERMISSION_KEY, permission),
    UseGuards(CmsAuthGuard, CmsPermissionGuard),
  );
}

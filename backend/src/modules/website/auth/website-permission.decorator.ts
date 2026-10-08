import { SetMetadata, applyDecorators, UseGuards } from '@nestjs/common';
import { WebsitePermission } from './website-role.enum';
import { WebsiteAuthGuard } from './website-auth.guard';
import { WebsitePermissionGuard } from './website-permission.guard';
import { PERMISSION_KEY } from './website-permission.constants';

/**
 * Composes both guards: verify identity (SMS signature) THEN check this
 * backend's own permission table. Usage: @WebsitePermission(WebsitePermission.CONTENT_WRITE)
 */
export function RequireWebsitePermission(permission: WebsitePermission) {
  return applyDecorators(
    SetMetadata(PERMISSION_KEY, permission),
    UseGuards(WebsiteAuthGuard, WebsitePermissionGuard),
  );
}

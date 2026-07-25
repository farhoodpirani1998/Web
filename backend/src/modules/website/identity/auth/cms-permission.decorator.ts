import { SetMetadata, applyDecorators, UseGuards } from '@nestjs/common';
import { WebsitePermission } from '../../auth/website-role.enum';
import { CmsAuthGuard } from './cms-auth.guard';
import { CmsPermissionGuard } from './cms-permission.guard';
import { CMS_PERMISSION_KEY } from './cms-permission.constants';

/**
 * CMS Admin's counterpart to `RequireWebsitePermission`
 * (`auth/website-permission.decorator.ts`) — same shape and the same
 * `WebsitePermission` values, but composes `CmsAuthGuard` +
 * `CmsPermissionGuard` instead of `WebsiteAuthGuard` +
 * `WebsitePermissionGuard`. Verifies identity (this backend's own CMS
 * JWT) THEN checks the CMS-local permission model.
 *
 * Sprint 3.2: this is now the authorization decorator every CMS Admin
 * content controller (Media, News, Pages, Hero, Gallery, etc.) uses.
 * `RequireWebsitePermission` remains untouched and still exists for
 * whatever SMS-facing routes exist/return in the future — it is simply
 * no longer applied to CMS Admin's own routes.
 *
 * Usage: `@RequireCmsPermission(WebsitePermission.CONTENT_WRITE)`
 */
export function RequireCmsPermission(permission: WebsitePermission) {
  return applyDecorators(
    SetMetadata(CMS_PERMISSION_KEY, permission),
    UseGuards(CmsAuthGuard, CmsPermissionGuard),
  );
}

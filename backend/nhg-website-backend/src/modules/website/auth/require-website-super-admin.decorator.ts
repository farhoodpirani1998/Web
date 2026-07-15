import { applyDecorators, UseGuards } from '@nestjs/common';
import { WebsiteAuthGuard } from './website-auth.guard';
import { WebsiteSuperAdminGuard } from './website-super-admin.guard';

/**
 * Composes both guards: verify identity (SMS signature) THEN require
 * that the caller's own WebsiteRoleAssignment is SUPER_ADMIN. Kept as
 * its own decorator rather than a new WebsitePermission value — see
 * website-super-admin.guard.ts for why role management stays outside
 * ROLE_PERMISSIONS. Usage: @RequireWebsiteSuperAdmin()
 */
export function RequireWebsiteSuperAdmin() {
  return applyDecorators(UseGuards(WebsiteAuthGuard, WebsiteSuperAdminGuard));
}

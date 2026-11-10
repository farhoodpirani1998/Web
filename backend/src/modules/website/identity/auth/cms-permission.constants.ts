/**
 * Metadata key shared by `RequireCmsPermission` (which sets it) and
 * `CmsPermissionGuard` (which reads it). Lives in its own file for the
 * same reason `auth/website-permission.constants.ts` does — so the
 * decorator and guard files don't need to import each other just to
 * share this string.
 *
 * The metadata key used by CMS permission declarations.
 */
export const CMS_PERMISSION_KEY = 'cms_permission';

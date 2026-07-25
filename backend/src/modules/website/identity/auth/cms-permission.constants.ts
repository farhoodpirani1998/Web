/**
 * Metadata key shared by `RequireCmsPermission` (which sets it) and
 * `CmsPermissionGuard` (which reads it). Lives in its own file for the
 * same reason `auth/website-permission.constants.ts` does — so the
 * decorator and guard files don't need to import each other just to
 * share this string.
 *
 * Deliberately a distinct key from `auth/website-permission.constants.ts`'s
 * `PERMISSION_KEY` (SMS-facing routes), not a shared/reused one — the
 * two permission systems are checked by two entirely separate guards
 * reading two entirely separate identity sources (see
 * `CmsPermissionGuard`'s doc comment), and giving them the same
 * Reflector metadata key would be a coincidence waiting to cause
 * confusion, not a reason to couple them.
 */
export const CMS_PERMISSION_KEY = 'cms_permission';

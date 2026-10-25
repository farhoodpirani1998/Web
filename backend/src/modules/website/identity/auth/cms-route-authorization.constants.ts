/**
 * Metadata key for `AllowAnonymousCmsEntry`, read by
 * `CmsRouteDefaultDenyGuard`. Own file for the same reason
 * `cms-permission.constants.ts` is one: decorator and guard share the string
 * without importing each other.
 */
export const CMS_ANONYMOUS_ENTRY_KEY = 'cms_anonymous_entry';

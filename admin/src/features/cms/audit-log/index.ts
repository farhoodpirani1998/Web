/**
 * Public surface of the `cms/audit-log` feature.
 *
 * Other layers (currently only `features/cms/dashboard`) should import
 * from here rather than reaching into `./api`/`./types` directly —
 * same convention as every other CMS module.
 */
export type { CmsAuditLogEntry } from "./types";
export { fetchRecentActivity } from "./api";

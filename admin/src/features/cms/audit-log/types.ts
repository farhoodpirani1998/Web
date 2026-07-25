/**
 * Types for the CMS Audit Log module, mirroring the backend
 * `AuditLogEntry` entity
 * (`backend/src/modules/website/core/audit-log/entities/audit-log-entry.entity.ts`).
 * Same "mirror, don't import" reasoning as every other `types.ts` in
 * this admin frontend.
 *
 * `siteId` is deliberately not modeled here, same call every other
 * module's `types.ts` makes — nothing in this admin frontend acts on
 * it (exactly one site exists, resolved server-side).
 *
 * This powers only the Dashboard's "Recent Activity" section
 * (`features/cms/dashboard/DashboardRecentActivity.tsx`) — a plain,
 * read-only feed, not a full CRUD module, hence no create/update
 * payload types here.
 */

/**
 * One row of CMS activity. `action` is a free-form string from the
 * backend (a `PublishStatus` value like "published"/"draft"/"archived",
 * or a fixed literal like "media_uploaded"/"settings_updated") — see
 * `AuditLogEntry`'s own comment for why this isn't a closed union here.
 */
export interface CmsAuditLogEntry {
  id: string;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

import { apiClient } from "@/lib/apiClient";

import type { CmsAuditLogEntry } from "./types";

/**
 * Request functions for the CMS Admin Audit Log endpoint
 * (`backend/src/modules/website/core/audit-log/audit-log.controller.ts`,
 * `@Controller('admin/audit-log')`).
 *
 * Only this file is aware of the `/audit-log` URL — callers use this
 * function, never `apiClient` directly (same convention as every other
 * module's `api.ts`). Path is bare (`/audit-log`, not `/admin/audit-log`)
 * because `apiClient`'s base URL already points at `.../admin`.
 */

/**
 * `GET /admin/audit-log` — the most recent activity across the CMS,
 * newest first, already capped server-side (`AuditLogService.listRecent`'s
 * own default limit). No params: there's no filter/pagination on this
 * endpoint today, matching the "short recent slice, not a full log
 * viewer" scope of the Dashboard section this feeds.
 */
export async function fetchRecentActivity(): Promise<CmsAuditLogEntry[]> {
  const response = await apiClient.get<CmsAuditLogEntry[]>("/audit-log");
  return response.data;
}

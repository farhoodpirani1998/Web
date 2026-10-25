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
 * newest first. Optional `limit` caps how many rows come back (the
 * Dashboard omits it → server default; the Audit Log page passes one).
 * The server clamps the value, so an out-of-range `limit` is safe.
 */
export async function fetchRecentActivity(limit?: number): Promise<CmsAuditLogEntry[]> {
  const response = await apiClient.get<CmsAuditLogEntry[]>("/audit-log", {
    params: limit ? { limit } : undefined,
  });
  return response.data;
}

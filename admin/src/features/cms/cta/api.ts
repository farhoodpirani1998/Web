import { apiClient } from "@/lib/apiClient";

import type { CmsCta, CmsCtaStatus, UpdateCtaPayload } from "./types";

/**
 * Request functions for the CMS Admin CTA endpoints
 * (`backend/src/modules/website/content/cta/cta.controller.ts`,
 * `@Controller('admin/cta')`).
 *
 * Only this file is aware of the `/cta` URLs — callers use these
 * functions, never `apiClient` directly (same convention as
 * `features/cms/about/api.ts`). Paths are bare (`/cta`, not
 * `/admin/cta`) because `apiClient`'s base URL already points at
 * `.../admin` (see `lib/env.ts`).
 *
 * No `:id` anywhere, no list/create/delete: CTA is a singleton (see
 * `types.ts`'s top comment) — every route acts on the one row for the
 * default site.
 */

/** `GET /admin/cta` — the singleton row, auto-seeded server-side (`CtaService.onModuleInit`). */
export async function fetchCta(): Promise<CmsCta> {
  const response = await apiClient.get<CmsCta>("/cta");
  return response.data;
}

/** `PATCH /admin/cta`. Does not touch `status` — see `updateCtaStatus` for that. */
export async function updateCta(payload: UpdateCtaPayload): Promise<CmsCta> {
  const response = await apiClient.patch<CmsCta>("/cta", payload);
  return response.data;
}

/**
 * `PATCH /admin/cta/status`. Gated server-side behind `content:publish`
 * (`CtaController.updateStatus`), separately from plain field edits
 * (`content:write`) — the two are kept as separate calls here for that
 * reason, not merged into `updateCta`.
 */
export async function updateCtaStatus(status: CmsCtaStatus): Promise<CmsCta> {
  const response = await apiClient.patch<CmsCta>("/cta/status", { status });
  return response.data;
}

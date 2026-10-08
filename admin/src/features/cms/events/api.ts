import { apiClient } from "@/lib/apiClient";

import type {
  CmsCalendarEvent,
  CmsEventRevision,
  CmsEventStatus,
  CreateCalendarEventPayload,
  ScheduleCalendarEventPayload,
  UpdateCalendarEventPayload,
} from "./types";

/**
 * Request functions for the CMS Admin Events endpoints
 * (`backend/src/modules/website/content/events/events.controller.ts`,
 * `@Controller('admin/events')`).
 *
 * Only this file is aware of the `/events` URLs — callers use these
 * functions, never `apiClient` directly (same convention as
 * `features/cms/news/api.ts`). Paths are bare (`/events`, not
 * `/admin/events`) because `apiClient`'s base URL already points at
 * `.../admin` (see `lib/env.ts`).
 *
 * No pagination/search params: `GET /admin/events` only supports the
 * optional `status`/`category` filters `EventsController.findAll`
 * reads — nothing here should invent query params the backend doesn't
 * read. No `/reorder` endpoint either — Events has no `position` field
 * (see `types.ts`'s top comment).
 */

/** `GET /admin/events` — optionally filtered by status and/or category. Returns a plain array (no pagination), sorted soonest-first by `startAt` server-side. */
export async function fetchEventsList(
  status?: CmsEventStatus,
  category?: string,
): Promise<CmsCalendarEvent[]> {
  const response = await apiClient.get<CmsCalendarEvent[]>("/events", {
    params: {
      ...(status ? { status } : {}),
      ...(category ? { category } : {}),
    },
  });
  return response.data;
}

/** `GET /admin/events/:id`. Rejects with a `not-found` `ApiError` (see `lib/apiError.ts`) for a bad id. */
export async function fetchCalendarEventById(id: string): Promise<CmsCalendarEvent> {
  const response = await apiClient.get<CmsCalendarEvent>(`/events/${id}`);
  return response.data;
}

/** `POST /admin/events`. New events are always created as `draft` server-side (`EventsService.create`). */
export async function createCalendarEvent(
  payload: CreateCalendarEventPayload,
): Promise<CmsCalendarEvent> {
  const response = await apiClient.post<CmsCalendarEvent>("/events", payload);
  return response.data;
}

/** `PATCH /admin/events/:id`. Does not touch `status`/`publishAt` — see `updateCalendarEventStatus`/`scheduleCalendarEvent` for those. */
export async function updateCalendarEvent(
  id: string,
  payload: UpdateCalendarEventPayload,
): Promise<CmsCalendarEvent> {
  const response = await apiClient.patch<CmsCalendarEvent>(`/events/${id}`, payload);
  return response.data;
}

/**
 * `DELETE /admin/events/:id`. Hard delete — `EventsService.remove` also
 * detaches the `MediaUsage` row for the featured image (if any), but
 * that's a server-side concern this call doesn't need to know about.
 */
export async function deleteCalendarEvent(id: string): Promise<void> {
  await apiClient.delete(`/events/${id}`);
}

/**
 * `PATCH /admin/events/:id/status`. Gated server-side behind
 * `content:publish` (`EventsController.updateStatus`), separately from
 * plain field edits (`content:write`) — the two are kept as separate
 * calls here for that reason, not merged into `updateCalendarEvent`.
 */
export async function updateCalendarEventStatus(
  id: string,
  status: CmsEventStatus,
): Promise<CmsCalendarEvent> {
  const response = await apiClient.patch<CmsCalendarEvent>(`/events/${id}/status`, { status });
  return response.data;
}

/**
 * `PATCH /admin/events/:id/schedule`. Distinct from `status` — gates
 * *when* a `published` event's listing actually becomes visible (see
 * the entity's own doc comment); gated server-side behind the same
 * `content:publish` permission as status changes, same reasoning as
 * `EventsController.schedule`.
 */
export async function scheduleCalendarEvent(
  id: string,
  payload: ScheduleCalendarEventPayload,
): Promise<CmsCalendarEvent> {
  const response = await apiClient.patch<CmsCalendarEvent>(`/events/${id}/schedule`, payload);
  return response.data;
}

/**
 * `GET /admin/events/:id/revisions`. Gated server-side behind
 * `website.revisions:view` (`EventsController.listRevisions`). Returned
 * newest-first (`RevisionsService.list`'s own ordering).
 */
export async function fetchEventRevisions(id: string): Promise<CmsEventRevision[]> {
  const response = await apiClient.get<CmsEventRevision[]>(`/events/${id}/revisions`);
  return response.data;
}

/**
 * `POST /admin/events/:id/revisions/:versionNumber/restore`. Gated
 * server-side behind `website.revisions:restore`
 * (`EventsController.restoreRevision`) — a stricter permission than
 * `website.revisions:view`, since restoring overwrites the live event
 * (as a new edit, which itself records a new revision — non-destructive,
 * per `RevisionsService`'s own doc comment).
 */
export async function restoreEventRevision(
  id: string,
  versionNumber: number,
): Promise<CmsCalendarEvent> {
  const response = await apiClient.post<CmsCalendarEvent>(
    `/events/${id}/revisions/${versionNumber}/restore`,
  );
  return response.data;
}

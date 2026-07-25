import { useMediaById } from "@/features/cms/media";
import { PermissionGate } from "@/components/ui/PermissionGate";

import { EventScheduleControl } from "./EventScheduleControl";
import { EventStatusControl } from "./EventStatusControl";
import type { CmsCalendarEvent, CmsEventStatus } from "./types";

/**
 * One event row in `EventList`'s table. No drag handle/move buttons —
 * unlike `FaqRow`/`HeroSlideRow`, Events has no `position`/`reorder`
 * endpoint (see `types.ts`'s top comment), so the list is always shown
 * in the server's chronological order.
 *
 * Resolves its own thumbnail via `media/useMediaById` — the event only
 * carries `featuredImageMediaId`, never an embedded media object, same
 * as `NewsRow`/`HeroSlideRow`.
 *
 * The "When" column is Events-specific (News/Pages have no equivalent
 * concept) — it formats `startAt`/`endAt`/`allDay` for a quick glance,
 * distinct from the "Publish at" column (`publishAt`, via
 * `EventScheduleControl`), which is a listing-visibility concern, not
 * when the event itself happens (see the entity's own doc comment).
 */
export interface EventRowProps {
  event: CmsCalendarEvent;
  isUpdatingStatus: boolean;
  isUpdatingSchedule: boolean;
  onEdit: (event: CmsCalendarEvent) => void;
  onDeleteRequest: (event: CmsCalendarEvent) => void;
  onChangeStatus: (event: CmsCalendarEvent, status: CmsEventStatus) => void;
  onSchedule: (event: CmsCalendarEvent, publishAt: string | null) => void;
  onViewHistory: (event: CmsCalendarEvent) => void;
}

/** Formats `startAt`/`endAt` for the list row, respecting `allDay` (date only, no time). */
function formatWhen(event: CmsCalendarEvent): string {
  const startDate = new Date(event.startAt);
  const dateFormat: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" };
  const timeFormat: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" };

  const start = event.allDay
    ? startDate.toLocaleDateString(undefined, dateFormat)
    : startDate.toLocaleString(undefined, { ...dateFormat, ...timeFormat });

  if (!event.endAt) return start;

  const endDate = new Date(event.endAt);
  const end = event.allDay
    ? endDate.toLocaleDateString(undefined, dateFormat)
    : endDate.toLocaleString(undefined, { ...dateFormat, ...timeFormat });

  return `${start} – ${end}`;
}

export function EventRow({
  event,
  isUpdatingStatus,
  isUpdatingSchedule,
  onEdit,
  onDeleteRequest,
  onChangeStatus,
  onSchedule,
  onViewHistory,
}: EventRowProps) {
  const { media, isLoading } = useMediaById(event.featuredImageMediaId);

  return (
    <tr>
      <td className="w-16 px-3 py-3 align-top">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-50">
          {event.featuredImageMediaId && isLoading ? (
            <span className="text-xs text-slate-400">…</span>
          ) : media ? (
            <img
              src={media.thumbnailUrl ?? media.url}
              alt={media.altText}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-xs text-slate-400">—</span>
          )}
        </div>
      </td>

      <td className="px-3 py-3 align-top">
        <p className="line-clamp-2 font-medium text-slate-900" dir="rtl">
          {event.title.fa}
        </p>
        {event.title.en ? (
          <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{event.title.en}</p>
        ) : null}
        <p className="mt-0.5 text-xs text-slate-400">/events/{event.slug}</p>
      </td>

      <td className="px-3 py-3 align-top text-slate-600">
        {event.category ? (
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">{event.category}</span>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        )}
      </td>

      <td className="px-3 py-3 align-top text-xs text-slate-600">{formatWhen(event)}</td>

      <td className="px-3 py-3 align-top">
        <EventStatusControl
          status={event.status}
          isUpdating={isUpdatingStatus}
          onChangeStatus={(status) => onChangeStatus(event, status)}
        />
      </td>

      <td className="px-3 py-3 align-top">
        <EventScheduleControl
          publishAt={event.publishAt}
          isUpdating={isUpdatingSchedule}
          onSchedule={(publishAt) => onSchedule(event, publishAt)}
        />
      </td>

      <td className="px-3 py-3 text-right align-top">
        <div className="flex flex-wrap justify-end gap-2">
          <PermissionGate permission="website.revisions:view">
            <button
              type="button"
              onClick={() => onViewHistory(event)}
              className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              History
            </button>
          </PermissionGate>
          <PermissionGate permission="website.content:write">
            <button
              type="button"
              onClick={() => onEdit(event)}
              className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Edit
            </button>
          </PermissionGate>
          <PermissionGate permission="website.content:write">
            <button
              type="button"
              onClick={() => onDeleteRequest(event)}
              className="rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          </PermissionGate>
        </div>
      </td>
    </tr>
  );
}

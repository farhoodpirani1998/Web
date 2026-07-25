import { EmptyState } from "@/components/ui/EmptyState";
import type { ApiError } from "@/lib/apiError";

import { EventRow } from "./EventRow";
import type { CmsCalendarEvent, CmsEventStatus } from "./types";

/**
 * Renders `useEvents`'s result — `EventsPage` owns the hook (and the
 * status/category filters driving it); this component only knows how
 * to display whatever list/loading/error state it's handed, same split
 * as `features/cms/news/NewsList.tsx`.
 *
 * No reorder controls: Events has no `position`/`reorder` endpoint
 * (see `types.ts`'s top comment) — the list is always shown in the
 * server's chronological order (`startAt` ASC, per
 * `EventsService.findAll`).
 */
export interface EventListProps {
  events: CmsCalendarEvent[];
  isLoading: boolean;
  error: ApiError | null;
  updatingStatusId: string | null;
  updatingScheduleId: string | null;
  onEdit: (event: CmsCalendarEvent) => void;
  onDeleteRequest: (event: CmsCalendarEvent) => void;
  onChangeStatus: (event: CmsCalendarEvent, status: CmsEventStatus) => void;
  onSchedule: (event: CmsCalendarEvent, publishAt: string | null) => void;
  onViewHistory: (event: CmsCalendarEvent) => void;
}

export function EventList({
  events,
  isLoading,
  error,
  updatingStatusId,
  updatingScheduleId,
  onEdit,
  onDeleteRequest,
  onChangeStatus,
  onSchedule,
  onViewHistory,
}: EventListProps) {
  if (isLoading) {
    return <p className="py-8 text-center text-sm text-slate-500">Loading events…</p>;
  }

  if (error) {
    return <p className="py-8 text-center text-sm text-red-600">{error.message}</p>;
  }

  if (events.length === 0) {
    return <EmptyState title="No events yet" description="Add an event to get started." />;
  }

  return (
    <div className="overflow-x-auto rounded-md border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className="w-16 px-3 py-2 text-left font-medium text-slate-500">
              <span className="sr-only">Image</span>
            </th>
            <th scope="col" className="px-3 py-2 text-left font-medium text-slate-500">
              Title
            </th>
            <th scope="col" className="px-3 py-2 text-left font-medium text-slate-500">
              Category
            </th>
            <th scope="col" className="px-3 py-2 text-left font-medium text-slate-500">
              When
            </th>
            <th scope="col" className="px-3 py-2 text-left font-medium text-slate-500">
              Status
            </th>
            <th scope="col" className="px-3 py-2 text-left font-medium text-slate-500">
              Publish at
            </th>
            <th scope="col" className="px-3 py-2 text-right font-medium text-slate-500">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {events.map((event) => (
            <EventRow
              key={event.id}
              event={event}
              isUpdatingStatus={updatingStatusId === event.id}
              isUpdatingSchedule={updatingScheduleId === event.id}
              onEdit={onEdit}
              onDeleteRequest={onDeleteRequest}
              onChangeStatus={onChangeStatus}
              onSchedule={onSchedule}
              onViewHistory={onViewHistory}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

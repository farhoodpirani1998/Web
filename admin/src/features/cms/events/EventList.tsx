import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import type { ApiError } from "@/lib/apiError";
import type { CmsCalendarEvent, CmsEventStatus } from "./types";
import { EventRow } from "./EventRow";

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
  if (isLoading) return <div className="py-8 space-y-3"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>;
  if (error) return <p className="py-8 text-center text-sm text-red-600">{error.message}</p>;
  if (events.length === 0) return <EmptyState title="هنوز رویدادی نیست" description="برای شروع یک رویداد اضافه کنید." />;
  return (
    <div dir="rtl" className="overflow-x-auto rounded-md border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <caption className="sr-only">فهرست رویدادها</caption>
        <thead className="bg-slate-50">
          <tr>
            <th className="px-3 py-2 text-right font-medium text-slate-500">تصویر</th>
            <th className="px-3 py-2 text-right font-medium text-slate-500">رویداد</th>
            <th className="px-3 py-2 text-right font-medium text-slate-500">دسته‌بندی</th>
            <th className="px-3 py-2 text-right font-medium text-slate-500">زمان رویداد</th>
            <th className="px-3 py-2 text-right font-medium text-slate-500">وضعیت</th>
            <th className="px-3 py-2 text-right font-medium text-slate-500">زمان انتشار</th>
            <th className="px-3 py-2 text-right font-medium text-slate-500">اقدامات</th>
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

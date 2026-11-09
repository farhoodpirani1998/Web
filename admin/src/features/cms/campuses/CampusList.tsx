/** Campus list with status, schedule, history, and reorder controls. */
import { EmptyState } from "@/components/ui/EmptyState";
import type { ApiError } from "@/lib/apiError";
import { CampusRow } from "./CampusRow";
import type { CmsCampus, CmsCampusStatus } from "./types";

export interface CampusListProps {
  campuses: CmsCampus[];
  isLoading: boolean;
  error: ApiError | null;
  status: CmsCampusStatus | undefined;
  updatingStatusId: string | null;
  updatingScheduleId: string | null;
  isReordering: boolean;
  onEdit: (campus: CmsCampus) => void;
  onDeleteRequest: (campus: CmsCampus) => void;
  onChangeStatus: (campus: CmsCampus, status: CmsCampusStatus) => void;
  onSchedule: (campus: CmsCampus, publishAt: string | null) => void;
  onViewHistory: (campus: CmsCampus) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export function CampusList({
  campuses,
  isLoading,
  error,
  status,
  updatingStatusId,
  updatingScheduleId,
  isReordering,
  onEdit,
  onDeleteRequest,
  onChangeStatus,
  onSchedule,
  onViewHistory,
  onReorder,
}: CampusListProps) {
  const canReorder = status === undefined;

  if (isLoading) return <p className="py-8 text-center text-sm text-slate-500">در حال بارگذاری پردیس‌ها…</p>;
  if (error) return <p className="py-8 text-center text-sm text-red-600">{error.message}</p>;
  if (campuses.length === 0) return <EmptyState title="هنوز پردیسی نیست" description="برای شروع یک پردیس اضافه کنید." />;

  return (
    <div dir="rtl" className="overflow-x-auto rounded-md border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <caption className="sr-only">فهرست پردیس‌ها</caption>
        <thead className="bg-slate-50">
          <tr>
            {canReorder ? <th scope="col" className="w-10 px-3 py-2"><span className="sr-only">مرتب‌سازی</span></th> : null}
            <th scope="col" className="px-3 py-2 text-right font-medium text-slate-500">تصویر</th>
            <th scope="col" className="px-3 py-2 text-right font-medium text-slate-500">نام</th>
            <th scope="col" className="px-3 py-2 text-right font-medium text-slate-500">نشانی</th>
            <th scope="col" className="px-3 py-2 text-right font-medium text-slate-500">وضعیت</th>
            <th scope="col" className="px-3 py-2 text-right font-medium text-slate-500">زمان انتشار</th>
            <th scope="col" className="px-3 py-2 text-right font-medium text-slate-500"><span className="sr-only">اقدامات</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {campuses.map((campus, index) => (
            <CampusRow
              key={campus.id}
              campus={campus}
              index={index}
              rowCount={campuses.length}
              canReorder={canReorder}
              isReordering={isReordering}
              isUpdatingStatus={updatingStatusId === campus.id}
              isUpdatingSchedule={updatingScheduleId === campus.id}
              onEdit={onEdit}
              onDeleteRequest={onDeleteRequest}
              onChangeStatus={onChangeStatus}
              onSchedule={onSchedule}
              onViewHistory={onViewHistory}
              onReorder={onReorder}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

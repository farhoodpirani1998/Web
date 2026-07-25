import { EmptyState } from "@/components/ui/EmptyState";
import type { ApiError } from "@/lib/apiError";

import { CampusRow } from "./CampusRow";
import type { CmsCampus, CmsCampusStatus } from "./types";

/**
 * Renders `useCampuses`'s result — `CampusesPage` owns the hook (and
 * the status filter driving it); this component only knows how to
 * display whatever list/loading/error state it's handed, same split as
 * `features/cms/teachers/TeacherList.tsx`/`features/cms/faq/FaqList.tsx`.
 *
 * Reordering is only enabled when `status` is `undefined` ("All"):
 * `PATCH /campuses/reorder` (`OrderingService.reorder`) writes
 * `position` for exactly the ids it's given, in that order — it does
 * not shift the ids left out. Sending a filtered subset would silently
 * corrupt the position of every campus not currently shown, so the
 * drag handle and move buttons only appear over the complete,
 * unfiltered list, same reasoning as `TeacherList`/`FaqList`.
 */
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
  if (isLoading) {
    return <p className="py-8 text-center text-sm text-slate-500">Loading campuses…</p>;
  }

  if (error) {
    return <p className="py-8 text-center text-sm text-red-600">{error.message}</p>;
  }

  if (campuses.length === 0) {
    return (
      <EmptyState
        title="No campuses yet"
        description="Add a campus to get started."
      />
    );
  }

  const canReorder = status === undefined;

  return (
    <div className="overflow-x-auto rounded-md border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            {canReorder ? (
              <th scope="col" className="w-10 px-3 py-2 text-left font-medium text-slate-500">
                <span className="sr-only">Reorder</span>
              </th>
            ) : null}
            <th scope="col" className="w-16 px-3 py-2 text-left font-medium text-slate-500">
              <span className="sr-only">Image</span>
            </th>
            <th scope="col" className="px-3 py-2 text-left font-medium text-slate-500">
              Name
            </th>
            <th scope="col" className="px-3 py-2 text-left font-medium text-slate-500">
              Address
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

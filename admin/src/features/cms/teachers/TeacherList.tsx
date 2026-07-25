import { EmptyState } from "@/components/ui/EmptyState";
import type { ApiError } from "@/lib/apiError";

import { TeacherRow } from "./TeacherRow";
import type { CmsTeacher, CmsTeacherStatus } from "./types";

/**
 * Renders `useTeachers`'s result — `TeachersPage` owns the hook (and
 * the status filter driving it); this component only knows how to
 * display whatever list/loading/error state it's handed, same split as
 * `features/cms/faq/FaqList.tsx`.
 *
 * Reordering is only enabled when `status` is `undefined` ("All"):
 * `PATCH /teachers/reorder` (`OrderingService.reorder`) writes
 * `position` for exactly the ids it's given, in that order — it does
 * not shift the ids left out. Sending a filtered subset would silently
 * corrupt the position of every teacher not currently shown, so the
 * drag handle and move buttons only appear over the complete,
 * unfiltered list, same reasoning as `FaqList`.
 */
export interface TeacherListProps {
  teachers: CmsTeacher[];
  isLoading: boolean;
  error: ApiError | null;
  status: CmsTeacherStatus | undefined;
  updatingStatusId: string | null;
  updatingScheduleId: string | null;
  isReordering: boolean;
  onEdit: (teacher: CmsTeacher) => void;
  onDeleteRequest: (teacher: CmsTeacher) => void;
  onChangeStatus: (teacher: CmsTeacher, status: CmsTeacherStatus) => void;
  onSchedule: (teacher: CmsTeacher, publishAt: string | null) => void;
  onViewHistory: (teacher: CmsTeacher) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export function TeacherList({
  teachers,
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
}: TeacherListProps) {
  if (isLoading) {
    return <p className="py-8 text-center text-sm text-slate-500">Loading teachers…</p>;
  }

  if (error) {
    return <p className="py-8 text-center text-sm text-red-600">{error.message}</p>;
  }

  if (teachers.length === 0) {
    return (
      <EmptyState
        title="No teachers yet"
        description="Add a teacher profile to get started."
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
              <span className="sr-only">Avatar</span>
            </th>
            <th scope="col" className="px-3 py-2 text-left font-medium text-slate-500">
              Name
            </th>
            <th scope="col" className="px-3 py-2 text-left font-medium text-slate-500">
              Department
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
          {teachers.map((teacher, index) => (
            <TeacherRow
              key={teacher.id}
              teacher={teacher}
              index={index}
              rowCount={teachers.length}
              canReorder={canReorder}
              isReordering={isReordering}
              isUpdatingStatus={updatingStatusId === teacher.id}
              isUpdatingSchedule={updatingScheduleId === teacher.id}
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

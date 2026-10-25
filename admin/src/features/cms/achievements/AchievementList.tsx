import { EmptyState } from "@/components/ui/EmptyState";
import type { ApiError } from "@/lib/apiError";

import { AchievementRow } from "./AchievementRow";
import type { CmsAchievement, CmsAchievementStatus } from "./types";

/**
 * Renders `useAchievements`'s result — `AchievementsPage` owns the hook
 * (and the status filter driving it); this component only displays
 * whatever list/loading/error state it's handed.
 *
 * Reordering is only enabled when `status` is `undefined` ("همه"):
 * `PATCH /achievements/reorder` writes `position` for exactly the ids
 * given, so a filtered subset would silently corrupt the order of every
 * row not currently shown.
 */
export interface AchievementListProps {
  achievements: CmsAchievement[];
  isLoading: boolean;
  error: ApiError | null;
  status: CmsAchievementStatus | undefined;
  updatingStatusId: string | null;
  isReordering: boolean;
  onEdit: (achievement: CmsAchievement) => void;
  onDeleteRequest: (achievement: CmsAchievement) => void;
  onChangeStatus: (achievement: CmsAchievement, status: CmsAchievementStatus) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export function AchievementList({
  achievements,
  isLoading,
  error,
  status,
  updatingStatusId,
  isReordering,
  onEdit,
  onDeleteRequest,
  onChangeStatus,
  onReorder,
}: AchievementListProps) {
  if (isLoading) {
    return <p className="py-8 text-center text-sm text-slate-500">در حال بارگذاری افتخارات…</p>;
  }

  if (error) {
    return <p className="py-8 text-center text-sm text-red-600">{error.message}</p>;
  }

  if (achievements.length === 0) {
    return (
      <EmptyState
        title="افتخاری ثبت نشده"
        description="برای شروع یک مقدار و برچسب اضافه کنید."
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
                <span className="sr-only">مرتب‌سازی</span>
              </th>
            ) : null}
            <th scope="col" className="px-3 py-2 text-left font-medium text-slate-500">
              مقدار
            </th>
            <th scope="col" className="px-3 py-2 text-left font-medium text-slate-500">
              برچسب
            </th>
            <th scope="col" className="px-3 py-2 text-left font-medium text-slate-500">
              آیکون
            </th>
            <th scope="col" className="px-3 py-2 text-left font-medium text-slate-500">
              وضعیت
            </th>
            <th scope="col" className="px-3 py-2 text-right font-medium text-slate-500">
              <span className="sr-only">اقدامات</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {achievements.map((achievement, index) => (
            <AchievementRow
              key={achievement.id}
              achievement={achievement}
              index={index}
              rowCount={achievements.length}
              canReorder={canReorder}
              isReordering={isReordering}
              isUpdatingStatus={updatingStatusId === achievement.id}
              onEdit={onEdit}
              onDeleteRequest={onDeleteRequest}
              onChangeStatus={onChangeStatus}
              onReorder={onReorder}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

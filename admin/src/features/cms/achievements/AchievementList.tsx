import { EmptyState } from "@/components/ui/EmptyState";
import { AchievementRow } from "./AchievementRow";
import type { CmsAchievement, CmsAchievementStatus } from "./types";
import type { ApiError } from "@/lib/apiError";

export interface AchievementListProps {
  achievements: CmsAchievement[];
  isLoading: boolean;
  error: ApiError | null;
  status?: CmsAchievementStatus;
  updatingStatusId?: string | null;
  isReordering?: boolean;
  onEdit: (a: CmsAchievement) => void;
  onDeleteRequest: (a: CmsAchievement) => void;
  onChangeStatus: (a: CmsAchievement, s: CmsAchievementStatus) => void;
  onReorder: (from: number, to: number) => void;
}

export function AchievementList({
  achievements,
  isLoading,
  error,
  status,
  updatingStatusId,
  isReordering = false,
  onEdit,
  onDeleteRequest,
  onChangeStatus,
  onReorder,
}: AchievementListProps) {
  const canReorder = status === undefined;
  if (isLoading) return <div className="p-4">در حال بارگذاری...</div>;
  if (error) return <div className="p-4 text-red-600">{error.message}</div>;
  if (!achievements.length) return <EmptyState title="افتخاری یافت نشد" />;
  return (
    <div dir="rtl" className="overflow-x-auto rounded-md border border-slate-200">
      <table className="w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            {canReorder ? <th scope="col" className="w-10 p-2"><span className="sr-only">مرتب‌سازی</span></th> : null}
            <th scope="col" className="p-2 text-right">مقدار</th>
            <th scope="col" className="p-2 text-right">عنوان</th>
            <th scope="col" className="p-2 text-right">آیکون</th>
            <th scope="col" className="p-2 text-right">وضعیت</th>
            <th scope="col" className="p-2 text-right"><span className="sr-only">اقدامات</span></th>
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

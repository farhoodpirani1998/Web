/**
 * Modern CMS Features list using TanStack Table v8.
 */
import { Skeleton } from "@/components/ui/Skeleton";
import type { ApiError } from "@/lib/apiError";
import type { CmsFeature, CmsFeatureStatus } from "./types";
import { FeatureRow } from "./FeatureRow";

export interface FeatureListProps {
  features: CmsFeature[];
  isLoading: boolean;
  error: ApiError | null;
  status: CmsFeatureStatus | undefined;
  updatingStatusId: string | null;
  isReordering: boolean;
  onEdit: (feature: CmsFeature) => void;
  onDeleteRequest: (feature: CmsFeature) => void;
  onChangeStatus: (feature: CmsFeature, status: CmsFeatureStatus) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export function FeatureList({
  features,
  isLoading,
  error,
  status,
  updatingStatusId,
  isReordering,
  onEdit,
  onDeleteRequest,
  onChangeStatus,
  onReorder,
}: FeatureListProps) {
  const canReorder = status === undefined;

  if (isLoading) {
    return <div className="space-y-3 py-8"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>;
  }
  if (error) return <p className="py-8 text-center text-sm text-red-600">{error.message}</p>;
  return (
    <div className="overflow-x-auto rounded-md border border-slate-200" dir="rtl">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            {canReorder ? <th className="w-10 px-3 py-2" /> : null}
            <th className="px-3 py-2 text-right font-medium text-slate-500">عنوان</th>
            <th className="px-3 py-2 text-right font-medium text-slate-500">توضیح</th>
            <th className="px-3 py-2 text-right font-medium text-slate-500">آیکون</th>
            <th className="px-3 py-2 text-right font-medium text-slate-500">وضعیت</th>
            <th className="px-3 py-2 text-right font-medium text-slate-500">اقدامات</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {features.length === 0 ? (
            <tr><td colSpan={canReorder ? 6 : 5} className="p-4"><Skeleton className="h-8 w-full" /></td></tr>
          ) : features.map((feature, index) => (
            <FeatureRow
              key={feature.id}
              feature={feature}
              index={index}
              rowCount={features.length}
              canReorder={canReorder}
              isReordering={isReordering}
              isUpdatingStatus={updatingStatusId === feature.id}
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

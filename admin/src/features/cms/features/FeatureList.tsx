import { EmptyState } from "@/components/ui/EmptyState";
import type { ApiError } from "@/lib/apiError";

import { FeatureRow } from "./FeatureRow";
import type { CmsFeature, CmsFeatureStatus } from "./types";

/**
 * Renders `useFeatures`'s result — `FeaturesPage` owns the hook (and
 * the status filter driving it); this component only knows how to
 * display whatever list/loading/error state it's handed, same split as
 * `features/cms/faq/FaqList.tsx`.
 *
 * Reordering is only enabled when `status` is `undefined` ("همه"):
 * `PATCH /features/reorder` (`OrderingService.reorder`) writes
 * `position` for exactly the ids it's given, in that order — it does
 * not shift the ids left out. Sending a filtered subset would silently
 * corrupt the position of every Feature not currently shown, so the
 * drag handle and move buttons only appear over the complete,
 * unfiltered list.
 */
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
  if (isLoading) {
    return <p className="py-8 text-center text-sm text-slate-500">در حال بارگذاری ویژگی‌ها…</p>;
  }

  if (error) {
    return <p className="py-8 text-center text-sm text-red-600">{error.message}</p>;
  }

  if (features.length === 0) {
    return (
      <EmptyState
        title="هنوز ویژگی‌ای نیست"
        description="برای شروع یک کارت ویژگی اضافه کنید."
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
              عنوان
            </th>
            <th scope="col" className="px-3 py-2 text-left font-medium text-slate-500">
              توضیحات
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
          {features.map((feature, index) => (
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

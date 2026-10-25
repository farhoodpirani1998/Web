import { EmptyState } from "@/components/ui/EmptyState";
import { PermissionGate } from "@/components/ui/PermissionGate";
import { SelectAllCheckbox } from "@/components/ui/SelectAllCheckbox";
import type { ApiError } from "@/lib/apiError";

import { NewsRow } from "./NewsRow";
import type { CmsNewsArticle, CmsNewsStatus } from "./types";

/**
 * Renders `useNews`'s result — `NewsPage` owns the hook (and the
 * status/category filters driving it); this component only knows how
 * to display whatever list/loading/error state it's handed, same split
 * as `features/cms/hero-slides/HeroSlideList.tsx`.
 *
 * No reorder controls: News has no `position`/`reorder` endpoint (see
 * `types.ts`'s top comment) — the list is always shown in the server's
 * reverse-chronological order (`publishAt`/`createdAt` DESC, per
 * `NewsService.findAll`).
 *
 * Selection state (`isSelected`/`onToggleSelect`/`onToggleSelectAll`)
 * is owned by `NewsPage` via `useRowSelection` — this component only
 * renders the checkboxes and wires their events, same "dumb display"
 * split the rest of the props already follow.
 */
export interface NewsListProps {
  articles: CmsNewsArticle[];
  isLoading: boolean;
  error: ApiError | null;
  status: CmsNewsStatus | undefined;
  updatingStatusId: string | null;
  updatingScheduleId: string | null;
  isSelected: (article: CmsNewsArticle) => boolean;
  isAllSelected: boolean;
  isSelectionIndeterminate: boolean;
  onToggleSelect: (article: CmsNewsArticle) => void;
  onToggleSelectAll: () => void;
  onEdit: (article: CmsNewsArticle) => void;
  onDeleteRequest: (article: CmsNewsArticle) => void;
  onChangeStatus: (article: CmsNewsArticle, status: CmsNewsStatus) => void;
  onSchedule: (article: CmsNewsArticle, publishAt: string | null) => void;
  onViewHistory: (article: CmsNewsArticle) => void;
}

export function NewsList({
  articles,
  isLoading,
  error,
  status,
  updatingStatusId,
  updatingScheduleId,
  isSelected,
  isAllSelected,
  isSelectionIndeterminate,
  onToggleSelect,
  onToggleSelectAll,
  onEdit,
  onDeleteRequest,
  onChangeStatus,
  onSchedule,
  onViewHistory,
}: NewsListProps) {
  if (isLoading) {
    return <p className="py-8 text-center text-sm text-slate-500">در حال بارگذاری اخبار…</p>;
  }

  if (error) {
    return <p className="py-8 text-center text-sm text-red-600">{error.message}</p>;
  }

  if (articles.length === 0) {
    return (
      <EmptyState
        title={status ? "موردی با این وضعیت نیست" : "موردی ثبت نشده"}
        description="برای شروع یک خبر اضافه کنید."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className="w-10 px-3 py-2 text-left font-medium text-slate-500">
              <PermissionGate permission="website.content:write">
                <SelectAllCheckbox
                  checked={isAllSelected}
                  indeterminate={isSelectionIndeterminate}
                  onChange={onToggleSelectAll}
                  aria-label="انتخاب همه اخبار"
                />
              </PermissionGate>
            </th>
            <th scope="col" className="w-16 px-3 py-2 text-left font-medium text-slate-500">
              <span className="sr-only">تصویر</span>
            </th>
            <th scope="col" className="px-3 py-2 text-left font-medium text-slate-500">
              عنوان
            </th>
            <th scope="col" className="px-3 py-2 text-left font-medium text-slate-500">
              دسته‌بندی
            </th>
            <th scope="col" className="px-3 py-2 text-left font-medium text-slate-500">
              وضعیت
            </th>
            <th scope="col" className="px-3 py-2 text-left font-medium text-slate-500">
              زمان انتشار
            </th>
            <th scope="col" className="px-3 py-2 text-right font-medium text-slate-500">
              <span className="sr-only">اقدامات</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {articles.map((article) => (
            <NewsRow
              key={article.id}
              article={article}
              isUpdatingStatus={updatingStatusId === article.id}
              isUpdatingSchedule={updatingScheduleId === article.id}
              selected={isSelected(article)}
              onToggleSelect={onToggleSelect}
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

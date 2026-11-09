import { useState } from "react";

import { Skeleton } from "@/components/ui/Skeleton";
import type { ApiError } from "@/lib/apiError";

import { NewsRow } from "./NewsRow";
import type { CmsNewsArticle, CmsNewsStatus } from "./types";

export interface NewsListProps {
  articles: CmsNewsArticle[];
  isLoading: boolean;
  error: ApiError | null;
  status?: CmsNewsStatus;
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

export default function NewsList(props: NewsListProps) {
  const [globalFilter, setGlobalFilter] = useState("");
  const { articles, isLoading, error } = props;
  const visibleArticles = articles.filter((article) => {
    const filter = globalFilter.trim().toLocaleLowerCase();
    return !filter || article.title.fa.toLocaleLowerCase().includes(filter) || article.slug.includes(filter);
  });

  return (
    <div dir="rtl" className="p-4">
      <h2 className="mb-3 text-xl font-bold text-brand-900">لیست اخبار</h2>
      <input
        value={globalFilter}
        onChange={(event) => setGlobalFilter(event.target.value)}
        aria-label="جستجوی اخبار" placeholder="جستجو..."
        className="mb-3 w-full rounded border px-3 py-1 md:w-96"
      />
      {error ? <p role="alert" className="text-sm text-red-600">{error.message}</p> : null}
      {isLoading ? (
        <div className="space-y-3 py-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ) : (
        <div className="overflow-auto">
          <table className="w-full border-collapse border text-sm">
            <thead className="bg-brand-50">
              <tr>
                <th className="border px-2 py-1">
                  <input
                    type="checkbox"
                    checked={props.isAllSelected}
                    ref={(element) => {
                      if (element) element.indeterminate = props.isSelectionIndeterminate;
                    }}
                    onChange={props.onToggleSelectAll}
                    aria-label="انتخاب همه خبرها"
                  />
                </th>
                <th className="border px-2 py-1 text-right">خبر</th>
                <th className="border px-2 py-1 text-right">دسته‌بندی</th>
                <th className="border px-2 py-1 text-right">وضعیت</th>
                <th className="border px-2 py-1 text-right">برنامه‌ریزی</th>
                <th className="border px-2 py-1 text-right">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {visibleArticles.map((article) => (
                <NewsRow
                  key={article.id}
                  article={article}
                  selected={props.isSelected(article)}
                  isUpdatingStatus={props.updatingStatusId === article.id}
                  isUpdatingSchedule={props.updatingScheduleId === article.id}
                  onToggleSelect={props.onToggleSelect}
                  onEdit={props.onEdit}
                  onDeleteRequest={props.onDeleteRequest}
                  onChangeStatus={props.onChangeStatus}
                  onSchedule={props.onSchedule}
                  onViewHistory={props.onViewHistory}
                />
              ))}
            </tbody>
          </table>
          {!visibleArticles.length && !isLoading ? <p className="py-4 text-center text-sm">خبری یافت نشد.</p> : null}
        </div>
      )}
    </div>
  );
}

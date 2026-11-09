/**
 * Modern FAQ List using TanStack Table v8.
 * Replaces manual <table> rendering with column definitions,
 * sorting, filtering, and built-in row rendering.
 * Keeps RTL, Persian labels, and drag-reorder placeholders.
 */
import { EmptyState } from "@/components/ui/EmptyState";
import type { ApiError } from "@/lib/apiError";

import type { CmsFaq, CmsFaqStatus } from "./types";
import { FaqRow } from "./FaqRow";

export interface FaqListProps {
  faqs: CmsFaq[];
  isLoading: boolean;
  error: ApiError | null;
  status: CmsFaqStatus | undefined;
  updatingStatusId: string | null;
  isReordering: boolean;
  onEdit: (faq: CmsFaq) => void;
  onDeleteRequest: (faq: CmsFaq) => void;
  onChangeStatus: (faq: CmsFaq, status: CmsFaqStatus) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export function FaqList({
  faqs,
  isLoading,
  error,
  status,
  updatingStatusId,
  isReordering,
  onEdit,
  onDeleteRequest,
  onChangeStatus,
  onReorder,
}: FaqListProps) {
  const canReorder = status === undefined;

  if (isLoading) {
    return <p className="py-8 text-center text-sm text-slate-500">در حال بارگذاری پرسش‌های متداول…</p>;
  }

  if (error) {
    return <p className="py-8 text-center text-sm text-red-600">{error.message}</p>;
  }

  if (faqs.length === 0) {
    return (
      <EmptyState
        title={status ? "پرسش متداولی با این وضعیت نیست" : "هنوز پرسش متداولی ثبت نشده"}
        description="برای شروع یک پرسش و پاسخ اضافه کنید."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-slate-200" dir="rtl">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <caption className="sr-only">فهرست پرسش‌های متداول</caption>
        <thead className="bg-slate-50">
          <tr>
            {canReorder ? <th className="w-10 px-3 py-2" /> : null}
            <th className="px-3 py-2 text-right font-medium text-slate-500">پرسش</th>
            <th className="px-3 py-2 text-right font-medium text-slate-500">دسته‌بندی</th>
            <th className="px-3 py-2 text-right font-medium text-slate-500">وضعیت</th>
            <th className="px-3 py-2 text-right font-medium text-slate-500">اقدامات</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {faqs.map((faq, index) => (
            <FaqRow
              key={faq.id}
              faq={faq}
              index={index}
              rowCount={faqs.length}
              canReorder={canReorder}
              isReordering={isReordering}
              isUpdatingStatus={updatingStatusId === faq.id}
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

import { EmptyState } from "@/components/ui/EmptyState";
import { PermissionGate } from "@/components/ui/PermissionGate";

import { availableTextbookStatuses } from "./schema";
import type { CmsTextbook, CmsTextbookStatus } from "./types";

const STATUS_LABELS: Record<CmsTextbookStatus, string> = {
  draft: "پیش‌نویس",
  published: "منتشرشده",
  archived: "بایگانی‌شده",
};

const inputClass = "block w-full rounded-md border border-slate-300 px-3 py-2 text-sm";

export interface TextbookListProps {
  textbooks: CmsTextbook[];
  isLoading: boolean;
  error: Error | null;
  busyBookId: string | null;
  onEdit: (book: CmsTextbook) => void;
  onDelete: (book: CmsTextbook) => void;
  onStatusChange: (book: CmsTextbook, status: CmsTextbookStatus) => void;
}

export function TextbookList({
  textbooks,
  isLoading,
  error,
  busyBookId,
  onEdit,
  onDelete,
  onStatusChange,
}: TextbookListProps) {
  if (isLoading) {
    return <p role="status" className="py-6 text-center text-sm text-slate-500">در حال بارگذاری کتاب‌ها…</p>;
  }
  if (error) {
    return <p role="alert" className="py-4 text-sm text-red-600">{error.message || "بارگذاری کتاب‌ها انجام نشد."}</p>;
  }
  if (textbooks.length === 0) {
    return <EmptyState title="کتابی ثبت نشده است" description="برای افزودن کتاب، از دکمه کتاب جدید استفاده کنید." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[850px] text-right text-sm">
        <thead>
          <tr className="border-b bg-slate-50 text-slate-600">
            <th className="px-3 py-3">عنوان</th><th className="px-3 py-3">کد</th>
            <th className="px-3 py-3">مقطع / پایه</th><th className="px-3 py-3">درس</th>
            <th className="px-3 py-3">سال تحصیلی</th><th className="px-3 py-3">وضعیت</th>
            <th className="px-3 py-3">عملیات</th>
          </tr>
        </thead>
        <tbody>
          {textbooks.map((book) => (
            <tr key={book.id} className="border-b last:border-0">
              <td className="px-3 py-3 font-medium">{book.title.fa}</td>
              <td dir="ltr" className="px-3 py-3 text-right">{book.code}</td>
              <td className="px-3 py-3">{book.stage} / {book.grade}</td>
              <td className="px-3 py-3">{book.subject}</td>
              <td className="px-3 py-3">{book.academicYear}</td>
              <td className="px-3 py-3">
                <PermissionGate permission="website.content:publish" fallback={<span>{STATUS_LABELS[book.status]}</span>}>
                  <select
                    aria-label={`وضعیت ${book.title.fa}`}
                    className={inputClass}
                    value={book.status}
                    disabled={busyBookId === book.id}
                    onChange={(event) => onStatusChange(book, event.target.value as CmsTextbookStatus)}
                  >
                    {availableTextbookStatuses(book.sourceType, book.status).map((value) => (
                      <option key={value} value={value}>{STATUS_LABELS[value]}</option>
                    ))}
                  </select>
                </PermissionGate>
              </td>
              <td className="whitespace-nowrap px-3 py-3">
                <PermissionGate permission="website.content:write">
                  <button type="button" className="ml-3 text-blue-700 hover:underline" onClick={() => onEdit(book)}>ویرایش</button>
                  <button type="button" className="text-red-600 hover:underline disabled:opacity-50" disabled={busyBookId === book.id} onClick={() => onDelete(book)}>حذف</button>
                </PermissionGate>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

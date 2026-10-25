import { useState } from "react";

import { ApiError } from "@/lib/apiError";

import { deleteAcademicCalendarEntry } from "./api";
import type { CmsAcademicCalendarEntry } from "./types";

/** Confirms and performs `DELETE /admin/academic-calendar-entries/:id`. */
export interface AcademicCalendarDeleteConfirmProps {
  entry: CmsAcademicCalendarEntry;
  onCancel: () => void;
  onDeleted: (id: string) => void;
}

export function AcademicCalendarDeleteConfirm({
  entry,
  onCancel,
  onDeleted,
}: AcademicCalendarDeleteConfirmProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setIsDeleting(true);
    setError(null);

    try {
      await deleteAcademicCalendarEntry(entry.id);
      onDeleted(entry.id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "مشکلی پیش آمد. لطفاً دوباره تلاش کنید.");
      setIsDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">حذف ورودی تقویم</h2>
        <p className="mt-1 text-sm text-slate-600" dir="rtl">
          این عمل «{entry.title.fa}» را برای همیشه حذف می‌کند. قابل بازگشت نیست.
        </p>

        {error ? (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-red-300"
          >
            {isDeleting ? "در حال حذف…" : "حذف"}
          </button>
        </div>
      </div>
    </div>
  );
}

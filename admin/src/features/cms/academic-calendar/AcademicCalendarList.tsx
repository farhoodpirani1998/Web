import { EmptyState } from "@/components/ui/EmptyState";
import { PermissionGate } from "@/components/ui/PermissionGate";
import type { ApiError } from "@/lib/apiError";

import { AcademicCalendarStatusControl } from "./AcademicCalendarStatusControl";
import {
  type AcademicCalendarEntryKind,
  type CmsAcademicCalendarEntry,
  type CmsAcademicCalendarStatus,
} from "./types";

/**
 * Table of academic-calendar entries. Reorder (up/down) is only offered
 * when no filter is active — `PATCH /academic-calendar-entries/reorder`
 * writes `position` for exactly the ids given, so a filtered subset
 * would corrupt the order of rows not currently shown.
 */
export interface AcademicCalendarListProps {
  entries: CmsAcademicCalendarEntry[];
  isLoading: boolean;
  error: ApiError | null;
  isFiltered: boolean;
  updatingStatusId: string | null;
  isReordering: boolean;
  onEdit: (entry: CmsAcademicCalendarEntry) => void;
  onDeleteRequest: (entry: CmsAcademicCalendarEntry) => void;
  onChangeStatus: (entry: CmsAcademicCalendarEntry, status: CmsAcademicCalendarStatus) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  kindLabel: (kind: AcademicCalendarEntryKind) => string;
}

export function AcademicCalendarList({
  entries,
  isLoading,
  error,
  isFiltered,
  updatingStatusId,
  isReordering,
  onEdit,
  onDeleteRequest,
  onChangeStatus,
  onReorder,
  kindLabel,
}: AcademicCalendarListProps) {
  if (isLoading) {
    return <p className="py-8 text-center text-sm text-slate-500">در حال بارگذاری…</p>;
  }

  if (error) {
    return <p className="py-8 text-center text-sm text-red-600">{error.message}</p>;
  }

  if (entries.length === 0) {
    return (
      <EmptyState
        title="ورودی‌ای یافت نشد"
        description="با دکمه «ورودی جدید» اولین مورد را اضافه کنید."
      />
    );
  }

  const canReorder = !isFiltered;

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
              نوع
            </th>
            <th scope="col" className="px-3 py-2 text-left font-medium text-slate-500">
              عنوان
            </th>
            <th scope="col" className="px-3 py-2 text-left font-medium text-slate-500">
              مقدار / تاریخ
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
          {entries.map((entry, index) => (
            <tr key={entry.id}>
              {canReorder ? (
                <td className="w-10 px-3 py-3 align-top">
                  <PermissionGate permission="website.content:write">
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        disabled={isReordering || index === 0}
                        onClick={() => onReorder(index, index - 1)}
                        aria-label="انتقال به بالا"
                        className="text-xs leading-none text-slate-500 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        disabled={isReordering || index === entries.length - 1}
                        onClick={() => onReorder(index, index + 1)}
                        aria-label="انتقال به پایین"
                        className="text-xs leading-none text-slate-500 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        ▼
                      </button>
                    </div>
                  </PermissionGate>
                </td>
              ) : null}

              <td className="px-3 py-3 align-top">
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">
                  {kindLabel(entry.kind)}
                </span>
              </td>

              <td className="px-3 py-3 align-top">
                <p className="line-clamp-2 font-medium text-slate-900" dir="rtl">
                  {entry.title.fa}
                </p>
              </td>

              <td className="px-3 py-3 align-top text-slate-600" dir="rtl">
                {entry.value ?? entry.dateRange ?? entry.date ?? "—"}
              </td>

              <td className="px-3 py-3 align-top">
                <AcademicCalendarStatusControl
                  status={entry.status}
                  isUpdating={updatingStatusId === entry.id}
                  onChangeStatus={(status) => onChangeStatus(entry, status)}
                />
              </td>

              <td className="px-3 py-3 text-right align-top">
                <div className="flex justify-end gap-2">
                  <PermissionGate permission="website.content:write">
                    <button
                      type="button"
                      onClick={() => onEdit(entry)}
                      className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      ویرایش
                    </button>
                  </PermissionGate>
                  <PermissionGate permission="website.content:write">
                    <button
                      type="button"
                      onClick={() => onDeleteRequest(entry)}
                      className="rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      حذف
                    </button>
                  </PermissionGate>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Modern Academic Calendar List using TanStack Table v8.
 */
import { useState, useMemo } from "react";
import {
  useLegacyTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type LegacyColumnDef,
} from "@tanstack/react-table/legacy";
import { flexRender } from "@tanstack/react-table";
import { ArrowUpDown, Edit3, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import type { ApiError } from "@/lib/apiError";
import { AcademicCalendarStatusControl } from "./AcademicCalendarStatusControl";
import { ACADEMIC_CALENDAR_KIND_LABELS } from "./types";
import type { CmsAcademicCalendarEntry, CmsAcademicCalendarStatus } from "./types";

const ACADEMIC_CALENDAR_SKELETON_KEYS = [
  "academic-calendar-skeleton-1",
  "academic-calendar-skeleton-2",
  "academic-calendar-skeleton-3",
  "academic-calendar-skeleton-4",
  "academic-calendar-skeleton-5",
] as const;

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
  kindLabel: (kind: CmsAcademicCalendarEntry["kind"]) => string;
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
  const [sorting, setSorting] = useState([{ id: "date", desc: true }]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<LegacyColumnDef<CmsAcademicCalendarEntry>[]>(
    () => [
      { accessorKey: "kind", header: "نوع", cell: ({ row }) => kindLabel(row.original.kind) || ACADEMIC_CALENDAR_KIND_LABELS[row.original.kind] },
      { accessorKey: "title.fa", header: "عنوان فارسی", cell: ({ row }) => row.original.title.fa },
      { accessorKey: "date", header: "تاریخ", cell: ({ getValue }) => (getValue() as string) || "-" },
      { accessorKey: "dateRange", header: "بازه", cell: ({ getValue }) => (getValue() as string) || "-" },
      { accessorKey: "value", header: "مقدار", cell: ({ getValue }) => (getValue() as string) || "-" },
      {
        accessorKey: "status",
        header: "وضعیت",
        cell: ({ row }) => (
          <AcademicCalendarStatusControl
            status={row.original.status}
            isUpdating={updatingStatusId === row.original.id}
            onChangeStatus={(status) => onChangeStatus(row.original, status)}
          />
        ),
      },
      {
        id: "actions",
        header: "عملیات",
        cell: ({ row }) => (
          <div className="flex gap-2">
            {!isFiltered ? (
              <>
                <button
                  type="button"
                  disabled={isReordering}
                  onClick={() => {
                    const index = entries.findIndex((entry) => entry.id === row.original.id);
                    onReorder(index, index - 1);
                  }}
                  aria-label={`انتقال به بالا ${row.original.title.fa}`}
                  className="rounded border px-1 disabled:opacity-40"
                >
                  ▲
                </button>
                <button
                  type="button"
                  disabled={isReordering}
                  onClick={() => {
                    const index = entries.findIndex((entry) => entry.id === row.original.id);
                    onReorder(index, index + 1);
                  }}
                  aria-label={`انتقال به پایین ${row.original.title.fa}`}
                  className="rounded border px-1 disabled:opacity-40"
                >
                  ▼
                </button>
              </>
            ) : null}
            <button onClick={() => onEdit(row.original)} aria-label={`ویرایش ${row.original.title.fa}`} className="rounded p-1 hover:bg-brand-50"><Edit3 size={16} /></button>
            <button onClick={() => onDeleteRequest(row.original)} aria-label={`حذف ${row.original.title.fa}`} className="rounded p-1 hover:bg-red-50 text-red-600"><Trash2 size={16} /></button>
          </div>
        ),
      },
    ],
    [entries, isFiltered, isReordering, kindLabel, onChangeStatus, onDeleteRequest, onEdit, onReorder, updatingStatusId],
  );

  const table = useLegacyTable({
    data: entries,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
  });

  if (isLoading) return <div className="space-y-2">{ACADEMIC_CALENDAR_SKELETON_KEYS.map((key) => <Skeleton key={key} className="h-10 w-full" />)}</div>;
  if (error) return <EmptyState title="خطا در بارگذاری" description={error.message} />;
  if (entries.length === 0) return <EmptyState title="موردی یافت نشد" description="هیچ رویدادی ثبت نشده است." />;

  return (
    <div dir="rtl" className="overflow-x-auto rounded-lg border shadow-sm">
      <div className="p-2">
        <input
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          aria-label="جستجوی تقویم آموزشی" placeholder="جستجو..."
          className="w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>
      <table className="w-full text-sm">
        <thead className="bg-brand-50 text-brand-900">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((h) => (
                <th key={h.id} className="px-4 py-3 text-right font-medium">
                  <button
                    onClick={h.column.getToggleSortingHandler()}
                    className="flex items-center gap-1 hover:text-brand-700"
                  >
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                    <ArrowUpDown size={14} />
                  </button>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-t hover:bg-gray-50">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-between p-3 border-t">
        <div className="text-xs text-gray-500">صفحه {table.getState().pagination.pageIndex + 1} از {table.getPageCount()}</div>
        <div className="flex gap-2">
          <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} aria-label="صفحه قبل" className="rounded-md border px-2 py-1 text-xs disabled:opacity-40"><ChevronRight size={14} /></button>
          <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} aria-label="صفحه بعد" className="rounded-md border px-2 py-1 text-xs disabled:opacity-40"><ChevronLeft size={14} /></button>
        </div>
      </div>
    </div>
  );
}

/**
 * Modern Academic Calendar List using TanStack Table v8.
 */
import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown, Edit3, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import type { ApiError } from "@/lib/apiError";
import { ACADEMIC_CALENDAR_KIND_LABELS } from "./types";
import type { CmsAcademicCalendarEntry, CmsAcademicCalendarStatus } from "./types";

export interface AcademicCalendarListProps {
  entries: CmsAcademicCalendarEntry[];
  isLoading: boolean;
  error: ApiError | null;
  status?: CmsAcademicCalendarStatus;
  onEdit: (entry: CmsAcademicCalendarEntry) => void;
  onDeleteRequest: (entry: CmsAcademicCalendarEntry) => void;
}

export function AcademicCalendarList({ entries, isLoading, error, onEdit, onDeleteRequest }: AcademicCalendarListProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "date", desc: true }]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<CmsAcademicCalendarEntry>[]>(
    () => [
      { accessorKey: "kind", header: "نوع", cell: ({ getValue }) => ACADEMIC_CALENDAR_KIND_LABELS[getValue() as string] || getValue() },
      { accessorKey: "title.fa", header: "عنوان فارسی", cell: ({ row }) => row.original.title.fa },
      { accessorKey: "date", header: "تاریخ", cell: ({ getValue }) => (getValue() as string) || "-" },
      { accessorKey: "dateRange", header: "بازه", cell: ({ getValue }) => (getValue() as string) || "-" },
      { accessorKey: "value", header: "مقدار", cell: ({ getValue }) => (getValue() as string) || "-" },
      {
        id: "actions",
        header: "عملیات",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <button onClick={() => onEdit(row.original)} aria-label="ویرایش" className="rounded p-1 hover:bg-brand-50"><Edit3 size={16} /></button>
            <button onClick={() => onDeleteRequest(row.original)} aria-label="حذف" className="rounded p-1 hover:bg-red-50 text-red-600"><Trash2 size={16} /></button>
          </div>
        ),
      },
    ],
    [onEdit, onDeleteRequest],
  );

  const table = useReactTable({
    data: entries,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  if (isLoading) return <Skeleton rows={5} />;
  if (error) return <EmptyState title="خطا در بارگذاری" message={error.message} />;
  if (entries.length === 0) return <EmptyState title="موردی یافت نشد" message="هیچ رویدادی ثبت نشده است." />;

  return (
    <div dir="rtl" className="overflow-x-auto rounded-lg border shadow-sm">
      <div className="p-2">
        <input
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="جستجو..."
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
                    {flexRender(h.column.columnDef.header, h.getContext())}
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
          <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="rounded-md border px-2 py-1 text-xs disabled:opacity-40"><ChevronRight size={14} /></button>
          <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="rounded-md border px-2 py-1 text-xs disabled:opacity-40"><ChevronLeft size={14} /></button>
        </div>
      </div>
    </div>
  );
}

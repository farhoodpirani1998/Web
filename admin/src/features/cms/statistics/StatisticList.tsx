/**
 * Statistics List using TanStack Table v8.
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
import type { CmsStatistic, CmsStatisticStatus } from "./types";

export interface StatisticListProps {
  statistics: CmsStatistic[];
  isLoading: boolean;
  error: ApiError | null;
  status?: CmsStatisticStatus;
  onEdit: (item: CmsStatistic) => void;
  onDeleteRequest: (item: CmsStatistic) => void;
}

export function StatisticList({ statistics, isLoading, error, onEdit, onDeleteRequest }: StatisticListProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "position", desc: false }]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<CmsStatistic>[]>(
    () => [
      { accessorKey: "label.fa", header: "عنوان فارسی", cell: ({ row }) => row.original.label.fa },
      { accessorKey: "label.en", header: "عنوان انگلیسی", cell: ({ row }) => row.original.label.en ?? "-" },
      { accessorKey: "value", header: "مقدار", cell: ({ getValue }) => getValue() },
      { accessorKey: "suffix", header: "پسوند", cell: ({ getValue }) => (getValue() as string) || "-" },
      { accessorKey: "status", header: "وضعیت", cell: ({ getValue }) => (getValue() as string) },
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
    data: statistics,
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
  if (error) return <EmptyState title="خطا" message={error.message} />;
  if (statistics.length === 0) return <EmptyState title="موردی یافت نشد" message="هیچ آماری ثبت نشده است." />;

  return (
    <div dir="rtl" className="overflow-x-auto rounded-lg border shadow-sm">
      <div className="p-2">
        <input value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="جستجو..." className="w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
      </div>
      <table className="w-full text-sm">
        <thead className="bg-brand-50 text-brand-900">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((h) => (
                <th key={h.id} className="px-4 py-3 text-right font-medium">
                  <button onClick={h.column.getToggleSortingHandler()} className="flex items-center gap-1 hover:text-brand-700">{flexRender(h.column.columnDef.header, h.getContext())}<ArrowUpDown size={14} /></button>
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

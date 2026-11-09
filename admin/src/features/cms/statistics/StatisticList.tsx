/**
 * Statistics List using TanStack Table v8.
 */
import { useState, useMemo } from "react";
import {
  useLegacyTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type LegacyColumnDef as ColumnDef,
} from "@tanstack/react-table/legacy";
import { flexRender, type SortingState } from "@tanstack/react-table";
import { ArrowUpDown, Edit3, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import type { ApiError } from "@/lib/apiError";
import type { CmsStatistic, CmsStatisticStatus } from "./types";
import { StatisticStatusControl } from "./StatisticStatusControl";

const STATISTIC_SKELETON_KEYS = [
  "statistic-skeleton-1",
  "statistic-skeleton-2",
  "statistic-skeleton-3",
  "statistic-skeleton-4",
  "statistic-skeleton-5",
] as const;

export interface StatisticListProps {
  statistics: CmsStatistic[];
  isLoading: boolean;
  error: ApiError | null;
  status?: CmsStatisticStatus;
  updatingStatusId: string | null;
  isReordering: boolean;
  onEdit: (item: CmsStatistic) => void;
  onDeleteRequest: (item: CmsStatistic) => void;
  onChangeStatus: (item: CmsStatistic, status: CmsStatisticStatus) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export function StatisticList({
  statistics,
  isLoading,
  error,
  status,
  updatingStatusId,
  isReordering,
  onEdit,
  onDeleteRequest,
  onChangeStatus,
  onReorder,
}: StatisticListProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "position", desc: false }]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<CmsStatistic>[]>(
    () => [
      { accessorKey: "label.fa", header: "عنوان فارسی", cell: ({ row }) => row.original.label.fa },
      { accessorKey: "label.en", header: "عنوان انگلیسی", cell: ({ row }) => row.original.label.en ?? "-" },
      { accessorKey: "value", header: "مقدار", cell: ({ getValue }) => getValue() },
      { accessorKey: "suffix", header: "پسوند", cell: ({ getValue }) => (getValue() as string) || "-" },
      {
        accessorKey: "status",
        header: "وضعیت",
        cell: ({ row }) => (
          <StatisticStatusControl
            status={row.original.status}
            isUpdating={updatingStatusId === row.original.id}
            onChangeStatus={(nextStatus) => onChangeStatus(row.original, nextStatus)}
          />
        ),
      },
      {
        id: "actions",
        header: "عملیات",
        cell: ({ row }) => (
          <div className="flex gap-2">
            {status === undefined ? (
              <>
                <button
                  type="button"
                  onClick={() => onReorder(row.index, row.index - 1)}
                  disabled={isReordering || row.index === 0}
                  aria-label={`انتقال به بالا ${row.original.label.fa}`}
                  className="rounded p-1 hover:bg-brand-50 disabled:opacity-40"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => onReorder(row.index, row.index + 1)}
                  disabled={isReordering || row.index === statistics.length - 1}
                  aria-label={`انتقال به پایین ${row.original.label.fa}`}
                  className="rounded p-1 hover:bg-brand-50 disabled:opacity-40"
                >
                  ↓
                </button>
              </>
            ) : null}
            <button onClick={() => onEdit(row.original)} aria-label={`ویرایش ${row.original.label.fa}`} className="rounded p-1 hover:bg-brand-50"><Edit3 size={16} /></button>
            <button onClick={() => onDeleteRequest(row.original)} aria-label={`حذف ${row.original.label.fa}`} className="rounded p-1 hover:bg-red-50 text-red-600"><Trash2 size={16} /></button>
          </div>
        ),
      },
    ],
    [
      onEdit,
      onDeleteRequest,
      status,
      isReordering,
      statistics.length,
      onChangeStatus,
      updatingStatusId,
      onReorder,
    ],
  );

  const table = useLegacyTable({
    data: statistics,
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

  if (isLoading) return <div className="space-y-2">{STATISTIC_SKELETON_KEYS.map((key) => <Skeleton key={key} className="h-10 w-full" />)}</div>;
  if (error) return <EmptyState title="خطا" description={error.message} />;
  if (statistics.length === 0) return <EmptyState title="موردی یافت نشد" description="هیچ آماری ثبت نشده است." />;

  return (
    <div dir="rtl" className="overflow-x-auto rounded-lg border shadow-sm">
      <div className="p-2">
        <input value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} aria-label="جستجوی آمار" placeholder="جستجو..." className="w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
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
          <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} aria-label="صفحه قبل" className="rounded-md border px-2 py-1 text-xs disabled:opacity-40"><ChevronRight size={14} /></button>
          <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} aria-label="صفحه بعد" className="rounded-md border px-2 py-1 text-xs disabled:opacity-40"><ChevronLeft size={14} /></button>
        </div>
      </div>
    </div>
  );
}

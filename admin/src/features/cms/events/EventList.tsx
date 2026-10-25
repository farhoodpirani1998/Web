import { useState, useMemo } from "react";
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, flexRender, type ColumnDef, type SortingState } from "@tanstack/react-table";
import { ArrowUpDown, ChevronLeft, ChevronRight, Edit3, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import type { ApiError } from "@/lib/apiError";
import type { CmsCalendarEvent, CmsEventStatus } from "./types";

export interface EventListProps {
  events: CmsCalendarEvent[]; isLoading: boolean; error: ApiError | null;
  onEdit: (e: CmsCalendarEvent) => void; onDeleteRequest: (e: CmsCalendarEvent) => void;
}

export function EventList({ events, isLoading, error, onEdit, onDeleteRequest }: EventListProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "startAt", desc: false }]);
  const columns = useMemo<ColumnDef<CmsCalendarEvent>[]>(() => [
    { accessorKey: "title", header: "عنوان", cell: ({ row }) => row.original.title.fa },
    { accessorKey: "slug", header: "نامک" },
    { accessorKey: "startAt", header: "زمان" },
    { accessorKey: "status", header: "وضعیت", cell: ({ row }) => row.original.status },
    { id: "actions", header: "اقدامات", enableSorting: false, cell: ({ row }) => (
      <div className="flex gap-1"><button onClick={() => onEdit(row.original)} aria-label="edit"><Edit3 className="h-4 w-4"/></button><button onClick={() => onDeleteRequest(row.original)} aria-label="delete"><Trash2 className="h-4 w-4"/></button></div>
    ) },
  ], [onEdit, onDeleteRequest]);
  const table = useReactTable({ data: events, columns, state: { sorting }, onSortingChange: setSorting, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(), getFilteredRowModel: getFilteredRowModel(), getPaginationRowModel: getPaginationRowModel() });
  if (isLoading) return <p className="py-8 text-center text-sm text-slate-500">در حال بارگذاری رویدادها…</p>;
  if (error) return <p className="py-8 text-center text-sm text-red-600">{error.message}</p>;
  if (events.length === 0) return <EmptyState title="هنوز رویدادی نیست" description="برای شروع یک رویداد اضافه کنید." />;
  return (
    <div dir="rtl" className="overflow-x-auto rounded-md border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm"><thead className="bg-slate-50"><tr>{table.getHeaderGroups().map(hg => hg.headers.map(h => <th key={h.id} onClick={h.column.getToggleSortingHandler()} className="px-3 py-2 text-right font-medium text-slate-500 cursor-pointer">{flexRender(h.column.columnDef.header, h.getContext())} {h.column.getIsSorted() === 'asc' ? '▲' : h.column.getIsSorted() === 'desc' ? '▼' : ''}</th>))}</tr></thead>
        <tbody className="divide-y divide-slate-200 bg-white">{table.getRowModel().rows.map(row => <tr key={row.id}>{row.getVisibleCells().map(cell => <td key={cell.id} className="px-3 py-2 whitespace-nowrap">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>)}</tbody>
      </table>
      <div className="flex items-center gap-2 p-2"><button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="px-2 py-1 border rounded"><ChevronRight className="h-4 w-4"/></button><span className="text-xs">صفحه {table.getState().pagination.pageIndex + 1}</span><button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="px-2 py-1 border rounded"><ChevronLeft className="h-4 w-4"/></button></div>
    </div>
  );
}

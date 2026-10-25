/** TanStack Table v8 campus list — no innerHTML, RTL preserved. */
import { useState, useMemo } from "react";
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender, type ColumnDef, type SortingState } from "@tanstack/react-table";
import { EmptyState } from "@/components/ui/EmptyState";
import type { ApiError } from "@/lib/apiError";
import type { CmsCampus, CmsCampusStatus } from "./types";

export interface CampusListProps {
  campuses: CmsCampus[]; isLoading: boolean; error: ApiError | null; status: CmsCampusStatus | undefined;
  updatingStatusId: string | null; updatingScheduleId: string | null; isReordering: boolean;
  onEdit: (c: CmsCampus) => void; onDeleteRequest: (c: CmsCampus) => void; onChangeStatus: (c: CmsCampus, s: CmsCampusStatus) => void;
  onSchedule: (c: CmsCampus, p: string | null) => void; onViewHistory: (c: CmsCampus) => void; onReorder: (from: number, to: number) => void;
}

export function CampusList({ campuses, isLoading, error, status, updatingStatusId, updatingScheduleId, isReordering, onEdit, onDeleteRequest, onChangeStatus, onSchedule, onViewHistory, onReorder }: CampusListProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "position", desc: false }]);
  const canReorder = status === undefined;
  const columns = useMemo<ColumnDef<CmsCampus>[]>(() => [
    ...(canReorder ? [{ id: "reorder", header: () => <span className="sr-only">مرتب‌سازی</span>, cell: () => null }] : []),
    { accessorKey: "title", header: () => "نام", cell: ({ row }) => <span className="font-medium">{row.original.title.fa}</span> },
    { accessorKey: "slug", header: () => "نامک", cell: ({ row }) => <span className="text-xs text-slate-500">{row.original.slug}</span> },
    { accessorKey: "address", header: () => "نشانی", cell: ({ row }) => <span className="text-xs">{row.original.address?.fa ?? "—"}</span> },
    { accessorKey: "status", header: () => "وضعیت", cell: ({ row }) => <span className="text-xs">{row.original.status}</span> },
    { accessorKey: "publishAt", header: () => "زمان انتشار", cell: ({ row }) => <span className="text-xs">{row.original.publishAt ?? "—"}</span> },
    { id: "actions", header: () => <span className="sr-only">اقدامات</span>, cell: ({ row }) => (
      <div className="flex gap-2 justify-end">
        <button onClick={() => onEdit(row.original)} className="text-indigo-600 text-xs">ویرایش</button>
        <button onClick={() => onDeleteRequest(row.original)} className="text-red-600 text-xs">حذف</button>
      </div>
    )},
  ], [canReorder, onEdit, onDeleteRequest]);
  const table = useReactTable({ data: campuses, columns, state: { sorting }, onSortingChange: setSorting, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel() });
  if (isLoading) return <p className="py-8 text-center text-sm text-slate-500">در حال بارگذاری پردیس‌ها…</p>;
  if (error) return <p className="py-8 text-center text-sm text-red-600">{error.message}</p>;
  if (campuses.length === 0) return <EmptyState title="هنوز پردیسی نیست" description="برای شروع یک پردیس اضافه کنید." />;
  return (
    <div dir="rtl" className="overflow-x-auto rounded-md border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50"><tr>{table.getHeaderGroups().map(g => g.headers.map(h => <th key={h.id} className="px-3 py-2 text-right font-medium text-slate-500" onClick={h.column.getToggleSortingHandler()}>{flexRender(h.column.columnDef.header, h.getContext())}</th>))}</tr></thead>
        <tbody className="divide-y divide-slate-200 bg-white">{table.getRowModel().rows.map(row => <tr key={row.id}>{row.getVisibleCells().map(cell => <td key={cell.id} className="px-3 py-2">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

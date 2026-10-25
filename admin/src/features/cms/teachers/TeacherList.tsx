/**
 * Modern Teacher List using TanStack Table v8.
 *
 * Replaces the old `<table>` manual rendering with:
 * - `useReactTable` for column definitions, sorting, filtering
 * - Built-in row selection (checkboxes)
 * - Sortable headers (click to sort by name, status, position, etc.)
 * - Status filter integrated with TanStack Query
 *
 * Keeps RTL, drag-reorder placeholders, and Persian labels.
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
import { ArrowUpDown, ChevronLeft, ChevronRight, Edit3, Trash2, Clock, Eye, MoveVertical } from "lucide-react";

import { EmptyState } from "@/components/ui/EmptyState";
import { PermissionGate } from "@/components/ui/PermissionGate";
import { SelectAllCheckbox } from "@/components/ui/SelectAllCheckbox";
import type { ApiError } from "@/lib/apiError";

import type { CmsTeacher, CmsTeacherStatus } from "./types";

export interface TeacherListProps {
  teachers: CmsTeacher[];
  isLoading: boolean;
  error: ApiError | null;
  status: CmsTeacherStatus | undefined;
  updatingStatusId: string | null;
  updatingScheduleId: string | null;
  isReordering: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (teacher: CmsTeacher) => void;
  onToggleSelectAll: () => void;
  onEdit: (teacher: CmsTeacher) => void;
  onDeleteRequest: (teacher: CmsTeacher) => void;
  onChangeStatus: (teacher: CmsTeacher, status: CmsTeacherStatus) => void;
  onSchedule: (teacher: CmsTeacher, publishAt: string | null) => void;
  onViewHistory: (teacher: CmsTeacher) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export function TeacherList({
  teachers,
  isLoading,
  error,
  status,
  updatingStatusId,
  updatingScheduleId,
  isReordering,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onEdit,
  onDeleteRequest,
  onChangeStatus,
  onSchedule,
  onViewHistory,
  onReorder,
}: TeacherListProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "position", desc: false }]);

  const columns = useMemo<ColumnDef<CmsTeacher>[]>(
    () => [
      {
        id: "select",
        header: () => (
          <PermissionGate permission="website.content:write">
            <SelectAllCheckbox
              checked={teachers.length > 0 && teachers.every((t) => selectedIds.has(t.id))}
              indeterminate={
                teachers.some((t) => selectedIds.has(t.id)) && !teachers.every((t) => selectedIds.has(t.id))
              }
              onChange={onToggleSelectAll}
              aria-label="انتخاب همه اساتید"
            />
          </PermissionGate>
        ),
        cell: ({ row }) => (
          <PermissionGate permission="website.content:write">
            <input
              type="checkbox"
              checked={selectedIds.has(row.original.id)}
              onChange={() => onToggleSelect(row.original)}
              aria-label={`انتخاب ${row.original.fullName}`}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
            />
          </PermissionGate>
        ),
        size: 40,
        enableSorting: false,
      },
      {
        accessorKey: "fullName",
        header: ({ column }) => (
          <button onClick={() => column.toggleSorting()} className="flex items-center gap-1 font-medium text-slate-500 hover:text-slate-900">
            نام <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <img
              src={row.original.avatarMediaId ? `/media/${row.original.avatarMediaId}/thumbnail` : "/avatar-placeholder.svg"}
              alt={row.original.fullName}
              className="h-8 w-8 rounded-full object-cover border border-slate-200 bg-slate-50 shrink-0"
              onError={(e) => { (e.target as HTMLImageElement).src = "/avatar-placeholder.svg"; }}
            />
            <div>
              <div className="font-medium text-slate-900">{row.original.fullName}</div>
              <div className="text-xs text-slate-500">{row.original.slug}</div>
            </div>
          </div>
        ),
        size: 220,
      },
      {
        accessorKey: "jobTitle.fa",
        id: "jobTitle",
        header: "عنوان شغلی",
        cell: ({ row }) => <span className="text-sm text-slate-700">{row.original.jobTitle.fa}</span>,
        size: 140,
      },
      {
        accessorKey: "department.fa",
        id: "department",
        header: "دپارتمان",
        cell: ({ row }) => <span className="text-sm text-slate-700">{row.original.department?.fa ?? "—"}</span>,
        size: 120,
      },
      {
        accessorKey: "position",
        header: ({ column }) => (
          <button onClick={() => column.toggleSorting()} className="flex items-center gap-1 font-medium text-slate-500 hover:text-slate-900">
            ترتیب <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: ({ row, table }) => {
          const canReorder = status === undefined && !isReordering;
          const index = table.getSortedRowModel().rows.findIndex(r => r.original.id === row.original.id);
          return (
            <div className="flex items-center gap-1">
              <span className="text-sm font-mono text-slate-500 w-6">{row.original.position}</span>
              {canReorder && (
                <button
                  type="button"
                  onClick={() => onReorder(index, index - 1)}
                  disabled={index <= 0}
                  className="p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                  aria-label="بالا"
                  title="بالا"
                >
                  <MoveVertical className="h-3 w-3 rotate-90" />
                </button>
              )}
            </div>
          );
        },
        size: 80,
      },
      {
        accessorKey: "status",
        header: "وضعیت",
        cell: ({ row }) => {
          const s = row.original.status;
          const color = s === "published" ? "bg-emerald-100 text-emerald-700" : s === "draft" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600";
          return (
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${color}`}>
              {s === "published" ? "منتشر" : s === "draft" ? " پیش‌نویس" : " آرشیو"}
            </span>
          );
        },
        size: 100,
        filterFn: "equalsString",
      },
      {
        accessorKey: "publishAt",
        header: "زمان انتشار",
        cell: ({ row }) =>
          row.original.publishAt ? (
            <span className="text-xs text-slate-500 whitespace-nowrap">{new Date(row.original.publishAt).toLocaleDateString("fa-IR")}</span>
          ) : (
            <span className="text-xs text-slate-400">—</span>
          ),
        size: 120,
      },
      {
        id: "actions",
        header: () => <span className="sr-only">اقدامات</span>,
        cell: ({ row }) => {
          const t = row.original;
          const isUpdatingStatus = updatingStatusId === t.id;
          const isUpdatingSchedule = updatingScheduleId === t.id;
          return (
            <div className="flex items-center justify-end gap-1">
              <button type="button" onClick={() => onEdit(t)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md" aria-label="ویرایش" title="ویرایش"><Edit3 className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => onDeleteRequest(t)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md" aria-label="حذف" title="حذف"><Trash2 className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => onViewHistory(t)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md" aria-label="تاریخچه" title="تاریخچه"><Eye className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => onSchedule(t, t.publishAt ? null : new Date().toISOString())} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md" aria-label="زمان‌بندی" title="زمان‌بندی" disabled={isUpdatingSchedule}><Clock className="h-3.5 w-3.5" /></button>
            </div>
          );
        },
        size: 160,
        enableSorting: false,
      },
    ],
    [teachers, selectedIds, status, isReordering, updatingStatusId, updatingScheduleId, onToggleSelect, onToggleSelectAll, onEdit, onDeleteRequest, onViewHistory, onSchedule, onReorder],
  );

  const table = useReactTable({
    data: teachers,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false,
    defaultColumn: { size: 100 },
  });

  if (isLoading) {
    return <p className="py-8 text-center text-sm text-slate-500">در حال بارگذاری اساتید…</p>;
  }

  if (error) {
    return <p className="py-8 text-center text-sm text-red-600">{error.message}</p>;
  }

  if (teachers.length === 0) {
    return <EmptyState title={status ? "موردی با این وضعیت نیست" : "هنوز استادی نیست"} description="برای شروع یک استاد اضافه کنید." />;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-brand-navy/10 shadow-[0_4px_24px_rgba(15,45,82,0.06)] bg-[#F5F7FA]" dir="rtl">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((h) => (
                <th key={h.id} colSpan={h.colSpan} className="px-3 py-2 text-right font-medium text-slate-500" style={{ width: h.getSize() }}>
                  {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50 transition-colors">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-3 py-2 whitespace-nowrap" style={{ width: cell.column.getSize() }}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
        <span>صفحه {table.getState().pagination.pageIndex + 1} از {table.getPageCount()}</span>
        <div className="flex gap-1">
          <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="p-1 hover:bg-slate-200 rounded disabled:opacity-30" aria-label="قبلی"><ChevronRight className="h-4 w-4 rotate-180" /></button>
          <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="p-1 hover:bg-slate-200 rounded disabled:opacity-30" aria-label="بعدی"><ChevronLeft className="h-4 w-4 rotate-180" /></button>
        </div>
      </div>
    </div>
  );
}

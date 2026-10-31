/**
 * Pre-Registration List using TanStack Table v8.
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
import { ArrowUpDown, Edit3, Trash2, ChevronLeft, ChevronRight, Eye } from "lucide-react";

import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import type { ApiError } from "@/lib/apiError";
import type { CmsPreRegistration, CmsPreRegistrationStatus } from "./types";

export interface PreRegistrationListProps {
  preRegistrations: CmsPreRegistration[];
  isLoading: boolean;
  error: ApiError | null;
  statusFilter?: CmsPreRegistrationStatus;
  onEdit: (item: CmsPreRegistration) => void;
  onDeleteRequest: (item: CmsPreRegistration) => void;
  onViewDetail: (item: CmsPreRegistration) => void;
  onChangeStatus: (item: CmsPreRegistration, status: CmsPreRegistrationStatus) => void;
}

export function PreRegistrationList({ preRegistrations, isLoading, error, onEdit, onDeleteRequest, onViewDetail, onChangeStatus }: PreRegistrationListProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "createdAt", desc: true }]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<CmsPreRegistration>[]>(
    () => [
      { accessorKey: "studentFirstName", header: "نام", cell: ({ row }) => `${row.original.studentFirstName} ${row.original.studentLastName}` },
      { accessorKey: "studentNationalId", header: "کد ملی" },
      { accessorKey: "studentGrade", header: "پایه" },
      { accessorKey: "status", header: "وضعیت", cell: ({ getValue }) => {
        const s = getValue() as CmsPreRegistrationStatus;
        const labels: Record<string, string> = { new: "جدید", contacted: "تماس گرفته شده", archived: "آرشیو" };
        return <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-800">{labels[s] || s}</span>;
      }},
      { accessorKey: "createdAt", header: "تاریخ ثبت", cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString("fa-IR") },
      {
        id: "actions",
        header: "عملیات",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <button onClick={() => onViewDetail(row.original)} aria-label="جزئیات" className="rounded p-1 hover:bg-brand-50"><Eye size={16} /></button>
            <button onClick={() => onEdit(row.original)} aria-label="ویرایش" className="rounded p-1 hover:bg-brand-50"><Edit3 size={16} /></button>
            <button onClick={() => onDeleteRequest(row.original)} aria-label="حذف" className="rounded p-1 hover:bg-red-50 text-red-600"><Trash2 size={16} /></button>
          </div>
        ),
      },
    ],
    [onEdit, onDeleteRequest, onViewDetail],
  );

  const table = useReactTable({
    data: preRegistrations,
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
  if (preRegistrations.length === 0) return <EmptyState title="موردی یافت نشد" message="هیچ پیش‌ثبت‌نامی موجود نیست." />;

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

import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { EmptyState } from "@/components/ui/EmptyState";
import { PermissionGate } from "@/components/ui/PermissionGate";
import type { ApiError } from "@/lib/apiError";
import { CmsPageStatus } from "./types";
import type { CmsPage, CmsPageStatus } from "./types";

export interface PageListProps {
  pages: CmsPage[];
  isLoading: boolean;
  error: ApiError | null;
  status?: CmsPageStatus;
  updatingStatusId: string | null;
  updatingScheduleId: string | null;
  updatingHomepageId: string | null;
  isSelected: (page: CmsPage) => boolean;
  isAllSelected: boolean;
  isSelectionIndeterminate: boolean;
  onToggleSelect: (page: CmsPage) => void;
  onToggleSelectAll: () => void;
  onEdit: (page: CmsPage) => void;
  onDeleteRequest: (page: CmsPage) => void;
  onChangeStatus: (page: CmsPage, status: CmsPageStatus) => void;
  onSchedule: (page: CmsPage, publishAt: string | null) => void;
  onSetHomepage: (page: CmsPage, isHomepage: boolean) => void;
  onViewHistory: (page: CmsPage) => void;
}

export function PageList({
  pages,
  isLoading,
  error,
  onEdit,
  onDeleteRequest,
  onChangeStatus,
  onSetHomepage,
  onViewHistory,
}: PageListProps) {
  const columns = useMemo<ColumnDef<CmsPage>[]>(() => [
    {
      accessorKey: "title",
      header: () => <span dir="rtl">عنوان</span>,
      cell: ({ row }) => <span dir="rtl">{row.original.title.fa}</span>,
    },
    {
      accessorKey: "slug",
      header: () => <span dir="rtl">نامک</span>,
    },
    {
      accessorKey: "status",
      header: () => <span dir="rtl">وضعیت</span>,
      cell: ({ row }) => <span dir="rtl">{row.original.status}</span>,
    },
    {
      accessorKey: "template",
      header: () => <span dir="rtl">قالب</span>,
      cell: ({ row }) => <span dir="rtl">{row.original.template}</span>,
    },
    {
      id: "actions",
      header: () => <span dir="rtl">عملیات</span>,
      cell: ({ row }) => (
        <div className="flex gap-2" dir="rtl">
          <button onClick={() => onEdit(row.original)} className="text-blue-600 text-xs">ویرایش</button>
          <button onClick={() => onChangeStatus(row.original, row.original.status === "published" ? "draft" : "published")} className="text-amber-600 text-xs">تغییر وضعیت</button>
          <button onClick={() => onSetHomepage(row.original, !row.original.isHomepage)} className="text-purple-600 text-xs">{row.original.isHomepage ? "برداشتن از صفحه اصلی" : "صفحه اصلی"}</button>
          <button onClick={() => onViewHistory(row.original)} className="text-green-600 text-xs">تاریخچه</button>
          <button onClick={() => onDeleteRequest(row.original)} className="text-red-600 text-xs">حذف</button>
        </div>
      ),
    },
  ], [onEdit, onChangeStatus, onSetHomepage, onViewHistory, onDeleteRequest]);

  const table = useReactTable({
    data: pages,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  if (isLoading) return <div dir="rtl" className="p-6 text-center">در حال بارگذاری...</div>;
  if (error) return <div dir="rtl" className="p-6 text-red-500">{error.message}</div>;
  if (!pages.length) return <EmptyState title="صفحه‌ای یافت نشد" />;

  return (
    <div dir="rtl" className="overflow-auto rounded-md border shadow-sm">
      <table className="w-full text-sm text-right">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((h) => (
                <th key={h.id} className="px-3 py-2 font-semibold text-xs whitespace-nowrap">
                  {flexRender(h.column.columnDef.header, h.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b hover:bg-gray-50">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-3 py-2 whitespace-nowrap">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-between px-3 py-2 text-xs border-t">
        <span>صفحه {table.getState().pagination.pageIndex + 1} از {table.getPageCount()}</span>
        <div className="flex gap-2">
          <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="px-2 py-1 border rounded">قبلی</button>
          <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="px-2 py-1 border rounded">بعدی</button>
        </div>
      </div>
    </div>
  );
}

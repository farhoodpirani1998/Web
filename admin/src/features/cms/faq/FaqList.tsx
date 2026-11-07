/**
 * Modern FAQ List using TanStack Table v8.
 * Replaces manual <table> rendering with column definitions,
 * sorting, filtering, and built-in row rendering.
 * Keeps RTL, Persian labels, and drag-reorder placeholders.
 */
import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown, MoveVertical, Edit3, Trash2 } from "lucide-react";

import { EmptyState } from "@/components/ui/EmptyState";
import type { ApiError } from "@/lib/apiError";

import type { CmsFaq, CmsFaqStatus } from "./types";

export interface FaqListProps {
  faqs: CmsFaq[];
  isLoading: boolean;
  error: ApiError | null;
  status: CmsFaqStatus | undefined;
  updatingStatusId: string | null;
  isReordering: boolean;
  onEdit: (faq: CmsFaq) => void;
  onDeleteRequest: (faq: CmsFaq) => void;
  onChangeStatus: (faq: CmsFaq, status: CmsFaqStatus) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export function FaqList({
  faqs,
  isLoading,
  error,
  status,
  updatingStatusId,
  isReordering,
  onEdit,
  onDeleteRequest,
  onChangeStatus,
  onReorder,
}: FaqListProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "position", desc: false }]);

  const canReorder = status === undefined;

  const columns = useMemo<ColumnDef<CmsFaq>[]>(
    () => [
      ...(canReorder
        ? [
            {
              id: "reorder",
              header: () => <span className="sr-only">مرتب‌سازی</span>,
              size: 40,
              cell: () => (
                <button
                  className="cursor-grab p-1 text-slate-400 hover:text-slate-600"
                  aria-label="جابجایی"
                >
                  <MoveVertical size={16} />
                </button>
              ),
            } as ColumnDef<CmsFaq>,
          ]
        : []),
      {
        accessorKey: "question",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting()}
            className="flex items-center gap-1 font-medium text-slate-500"
          >
            پرسش <ArrowUpDown size={14} />
          </button>
        ),
        cell: ({ row }) => {
          const q = row.original.question;
          return (
            <div className="max-w-xs truncate" dir="rtl">
              {q.fa} {q.en ? <span className="text-slate-400">({q.en})</span> : null}
            </div>
          );
        },
        size: 320,
      },
      {
        accessorKey: "category",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting()}
            className="flex items-center gap-1 font-medium text-slate-500"
          >
            دسته‌بندی <ArrowUpDown size={14} />
          </button>
        ),
        cell: ({ row }) => (
          <span className="text-slate-600" dir="rtl">
            {row.original.category || "—"}
          </span>
        ),
        size: 140,
      },
      {
        accessorKey: "status",
        header: () => <span className="font-medium text-slate-500">وضعیت</span>,
        cell: ({ row }) => {
          const faq = row.original;
          return (
            <button
              type="button"
              onClick={() => onChangeStatus(faq, faq.status === "published" ? "draft" : "published")}
              disabled={updatingStatusId === faq.id}
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                faq.status === "published"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {faq.status === "published" ? "منتشر" : "پیش‌نویس"}
            </button>
          );
        },
        size: 100,
      },
      {
        id: "actions",
        header: () => <span className="sr-only">اقدامات</span>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => onEdit(row.original)}
              className="rounded p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              aria-label="ویرایش"
            >
              <Edit3 size={16} />
            </button>
            <button
              type="button"
              onClick={() => onDeleteRequest(row.original)}
              className="rounded p-1 text-slate-500 hover:text-red-600 hover:bg-red-50"
              aria-label="حذف"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
        size: 80,
      },
    ],
    [canReorder, updatingStatusId, onEdit, onDeleteRequest, onChangeStatus],
  );

  const table = useReactTable({
    data: faqs,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) {
    return <p className="py-8 text-center text-sm text-slate-500">در حال بارگذاری پرسش‌های متداول…</p>;
  }

  if (error) {
    return <p className="py-8 text-center text-sm text-red-600">{error.message}</p>;
  }

  if (faqs.length === 0) {
    return (
      <EmptyState
        title={status ? "پرسش متداولی با این وضعیت نیست" : "هنوز پرسش متداولی ثبت نشده"}
        description="برای شروع یک پرسش و پاسخ اضافه کنید."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-slate-200" dir="rtl">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((h) => (
                <th
                  key={h.id}
                  colSpan={h.colSpan}
                  className="px-3 py-2 text-right font-medium text-slate-500"
                  style={{ width: h.getSize() }}
                  onClick={h.column.getToggleSortingHandler()}
                >
                  {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-3 py-2" style={{ width: cell.column.getSize() }}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

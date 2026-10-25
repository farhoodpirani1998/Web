import { useMemo } from "react";
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender, type ColumnDef } from "@tanstack/react-table";

import type { CmsTestimonial, CmsTestimonialStatus } from "./types";

export interface TestimonialListProps {
  testimonials: CmsTestimonial[];
  isLoading: boolean;
  error: { message?: string } | null;
  onEdit: (t: CmsTestimonial) => void;
  onDeleteRequest: (t: CmsTestimonial) => void;
  onChangeStatus: (t: CmsTestimonial, s: CmsTestimonialStatus) => void;
}

export function TestimonialList({ testimonials, isLoading, error, onEdit, onDeleteRequest, onChangeStatus }: TestimonialListProps) {
  const columns = useMemo<ColumnDef<CmsTestimonial>[]>(() => [
    { accessorKey: "authorName", header: "نام نویسنده", size: 180 },
    { accessorKey: "content.fa", header: "متن", cell: ({ row }) => <span dir="rtl">{row.original.content.fa}</span> },
    { accessorKey: "rating", header: "امتیاز", size: 80 },
    { accessorKey: "status", header: "وضعیت", size: 100 },
    { id: "actions", header: "عملیات", cell: ({ row }) => (
      <div className="flex gap-1">
        <button onClick={() => onEdit(row.original)} className="rounded px-2 py-1 text-xs bg-slate-800 text-white">ویرایش</button>
        <button onClick={() => onDeleteRequest(row.original)} className="rounded px-2 py-1 text-xs bg-red-600 text-white">حذف</button>
      </div>
    ) },
  ], [onEdit, onDeleteRequest, onChangeStatus]);

  const table = useReactTable({ data: testimonials ?? [], columns, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel() });

  if (isLoading) return <p className="py-8 text-center text-sm text-slate-500">در حال بارگذاری نظرات…</p>;
  if (error) return <p className="py-8 text-center text-sm text-red-600">خطا: {error.message}</p>;

  return (
    <div dir="rtl" className="overflow-x-auto rounded-md border border-slate-200">
      <table className="w-full text-sm text-right">
        <thead className="bg-slate-50 text-slate-700">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>{hg.headers.map((h) => (<th key={h.id} className="px-3 py-2 font-medium">{flexRender(h.column.columnDef.header, h.getContext())}</th>))}</tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50">
              {row.getVisibleCells().map((cell) => (<td key={cell.id} className="px-3 py-2">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Modern Gallery list — TanStack Table v8.
 */
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender } from "@tanstack/react-table";
import { useMemo } from "react";
import type { CmsGalleryItem } from "./types";

export interface GalleryListProps { items: CmsGalleryItem[]; onEdit: (i: CmsGalleryItem) => void; onDelete: (id: string) => void; }

export function GalleryList({ items, onEdit, onDelete }: GalleryListProps) {
  const columns = useMemo(() => [
    { header: "عنوان", accessorKey: "caption.fa" },
    { header: "دسته", accessorKey: "category" },
    { header: "وضعیت", accessorKey: "status" },
    { header: "ترتیب", accessorKey: "position" },
    { header: "عملیات", cell: ({ row }: any) => <div className="flex gap-2"><button onClick={() => onEdit(row.original)} className="text-blue-600">ویرایش</button><button onClick={() => onDelete(row.original.id)} className="text-red-600">حذف</button></div> },
  ], [onEdit, onDelete]);
  const table = useReactTable({ data: items, columns, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel() });
  return (
    <table dir="rtl" className="w-full border-collapse border">
      <thead><tr>{table.getHeaderGroups()[0].headers.map(h => <th key={h.id} className="border p-2 bg-gray-100 text-right">{flexRender(h.column.columnDef.header, h.getContext())}</th>)}</tr></thead>
      <tbody>{table.getRowModel().rows.map(r => <tr key={r.id}>{r.getVisibleCells().map(c => <td key={c.id} className="border p-2">{flexRender(c.column.columnDef.cell, c.getContext())}</td>)}</tr>)}</tbody>
    </table>
  );
}

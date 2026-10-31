/**
 * Modern CMS Features list using TanStack Table v8.
 */
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender } from "@tanstack/react-table";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import type { CmsFeature } from "./types";

export interface FeatureListProps {
  features: CmsFeature[];
  onEdit: (f: CmsFeature) => void;
  onDelete: (id: string) => void;
}

export function FeatureList({ features, onEdit, onDelete }: FeatureListProps) {
  const columns = useMemo(
    () => [
      { header: "عنوان فارسی", accessorKey: "title.fa" },
      { header: "توضیح", accessorKey: "description.fa" },
      { header: "آیکون", accessorKey: "icon" },
      { header: "وضعیت", accessorKey: "status" },
      { header: "ترتیب", accessorKey: "position" },
      {
        header: "عملیات",
        cell: ({ row }: any) => (
          <div className="flex gap-2">
            <button onClick={() => onEdit(row.original)} className="text-blue-600">ویرایش</button>
            <button onClick={() => onDelete(row.original.id)} className="text-red-600">حذف</button>
          </div>
        ),
      },
    ],
    [onEdit, onDelete]
  );

  const table = useReactTable({
    data: features,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <table dir="rtl" className="w-full border-collapse border">
      <thead>
        {table.getHeaderGroups().map((hg) => (
          <tr key={hg.id}>
            {hg.headers.map((h) => (
              <th key={h.id} className="border p-2 text-right bg-gray-100">{flexRender(h.column.columnDef.header, h.getContext())}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {features.length === 0 ? (
          <tr><td colSpan={columns.length} className="border p-4"><Skeleton className="h-8 w-full" /></td></tr>
        ) : (
          table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id} className="border p-2">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
            ))}
          </tr>
    </table>
  );
}

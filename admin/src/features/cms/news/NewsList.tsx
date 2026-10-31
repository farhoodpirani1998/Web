import { Skeleton } from "@/components/ui/Skeleton";
import { useState } from "react";
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, flexRender } from "@tanstack/react-table";
import { useNewsList } from "../hooks/useNews";
import type { CmsNewsArticle, CmsNewsStatus } from "../types";

export default function NewsList() {
  const { data = [], isLoading } = useNewsList();
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = [
    { header: "عنوان", accessorFn: (r: CmsNewsArticle) => r.title.fa || r.title.en || "", id: "title" },
    { header: "نامک", accessorKey: "slug" as const },
    { header: "وضعیت", accessorKey: "status" as const },
    { header: "تاریخ انتشار", accessorFn: (r: CmsNewsArticle) => r.publishAt ? new Date(r.publishAt).toLocaleDateString("fa-IR") : "—", id: "publishAt" },
  ];

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div dir="rtl" className="p-4">
      <h2 className="text-xl font-bold text-brand-900 mb-3">لیست اخبار</h2>
      <input
        value={globalFilter}
        onChange={e => setGlobalFilter(e.target.value)}
        placeholder="جستجو..."
        className="w-full md:w-96 border rounded px-3 py-1 mb-3"
      />
      {isLoading ? <div className="space-y-3 py-4"><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /></div> : (
        <table className="w-full border-collapse border text-sm">
          <thead className="bg-brand-50">
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id}>
                {hg.headers.map(h => (
                  <th key={h.id} className="border px-2 py-1 text-right cursor-pointer" onClick={h.column.getToggleSortingHandler()}>
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    {{ asc: " ▲", desc: " ▼" }[h.column.getIsSorted() as string] || null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="border px-2 py-1">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="flex gap-2 mt-3">
        <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="px-3 py-1 border rounded">قبلی</button>
        <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="px-3 py-1 border rounded">بعدی</button>
        <span className="text-xs self-center">صفحه {table.getState().pagination.pageIndex + 1} از {table.getPageCount()}</span>
      </div>
    </div>
  );
}

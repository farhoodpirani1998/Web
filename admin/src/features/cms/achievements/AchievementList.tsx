import { useMemo } from "react";
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { EmptyState } from "@/components/ui/EmptyState";
import { AchievementRow } from "./AchievementRow";
import type { CmsAchievement, CmsAchievementStatus } from "./types";

export interface AchievementListProps {
  achievements: CmsAchievement[];
  isLoading: boolean;
  error: any;
  status?: CmsAchievementStatus;
  updatingStatusId?: string | null;
  isReordering?: boolean;
  onEdit?: (a: CmsAchievement) => void;
  onDeleteRequest?: (a: CmsAchievement) => void;
  onChangeStatus?: (a: CmsAchievement, s: CmsAchievementStatus) => void;
  onReorder?: (from: number, to: number) => void;
}

export function AchievementList({ achievements, isLoading, error, onEdit, onDeleteRequest, onChangeStatus }: AchievementListProps) {
  const columns = useMemo<ColumnDef<CmsAchievement>[]>(() => [
    { accessorKey: "value", header: "مقدار" },
    { accessorKey: "label.fa", header: "عنوان (فارس)", cell: (info: any) => info.getValue() },
    { accessorKey: "status", header: "وضعیت" },
  ], []);
  const table = useReactTable({ data: achievements, columns, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel() });
  if (isLoading) return <div className="p-4">در حال بارگذاری...</div>;
  if (error) return <div className="p-4 text-red-600">خطا در بارگذاری</div>;
  if (!achievements.length) return <EmptyState title="افتخاری یافت نشد" />;
  return (
    <table dir="rtl" className="w-full text-sm">
      <thead><tr>{table.getHeaderGroups().map(hg => hg.headers.map(h => <th key={h.id} className="text-right p-2 border-b">{flexRender(h.column.columnDef.header, h.getContext())}</th>))}</tr></thead>
      <tbody>{table.getRowModel().rows.map(row => <AchievementRow key={row.original.id} achievement={row.original} onEdit={onEdit} onDeleteRequest={onDeleteRequest} onChangeStatus={onChangeStatus} />)}</tbody>
    </table>
  );
}

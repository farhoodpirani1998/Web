import { PermissionGate } from "@/components/ui/PermissionGate";
import type { CmsTrustBadge, CmsTrustBadgeStatus } from "./types";

export interface TrustBadgeListProps {
  trustBadges: CmsTrustBadge[];
  isLoading: boolean;
  error: Error | null;
  isReordering: boolean;
  updatingStatusId: string | null;
  onEdit: (badge: CmsTrustBadge) => void;
  onDelete: (badge: CmsTrustBadge) => void;
  onStatusChange: (badge: CmsTrustBadge, status: CmsTrustBadgeStatus) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export function TrustBadgeList({
  trustBadges,
  isLoading,
  error,
  isReordering,
  updatingStatusId,
  onEdit,
  onDelete,
  onStatusChange,
  onReorder,
}: TrustBadgeListProps) {
  if (isLoading) return <p>در حال بارگذاری نشان‌ها…</p>;
  if (error) {
    return <p role="alert" className="text-sm text-red-600">{error.message}</p>;
  }
  if (trustBadges.length === 0) {
    return <p className="text-sm text-slate-500">هنوز نشانی ثبت نشده است.</p>;
  }

  return (
    <ol className="space-y-3">
      {trustBadges.map((badge, index) => (
        <li
          key={badge.id}
          className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-3"
        >
          <span className="w-6 text-sm text-slate-500">{index + 1}</span>
          <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">
            تصویر ثبت‌شده
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium">{badge.name.fa}</p>
            <p className="text-xs text-slate-500" dir="ltr">
              {badge.url || "بدون پیوند"}
            </p>
          </div>
          <span className="text-xs text-slate-500">{badge.status}</span>
          <PermissionGate permission="website.content:publish">
            <select
              aria-label={`وضعیت ${badge.name.fa}`}
              value={badge.status}
              disabled={updatingStatusId === badge.id}
              onChange={(event) =>
                onStatusChange(
                  badge,
                  event.target.value as CmsTrustBadgeStatus,
                )
              }
              className="rounded border border-slate-300 px-2 py-1 text-sm"
            >
              <option value="draft">پیش‌نویس</option>
              <option value="published">منتشرشده</option>
              <option value="archived">بایگانی</option>
            </select>
          </PermissionGate>
          <PermissionGate permission="website.content:write">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onReorder(index, index - 1)}
                disabled={isReordering || index === 0}
                aria-label={`انتقال ${badge.name.fa} به بالا`}
                className="rounded border border-slate-300 px-2 py-1 text-sm disabled:opacity-40"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => onReorder(index, index + 1)}
                disabled={isReordering || index === trustBadges.length - 1}
                aria-label={`انتقال ${badge.name.fa} به پایین`}
                className="rounded border border-slate-300 px-2 py-1 text-sm disabled:opacity-40"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => onEdit(badge)}
                className="rounded border border-slate-300 px-2 py-1 text-sm"
              >
                ویرایش
              </button>
              <button
                type="button"
                onClick={() => onDelete(badge)}
                className="rounded border border-red-300 px-2 py-1 text-sm text-red-700"
              >
                حذف
              </button>
            </div>
          </PermissionGate>
        </li>
      ))}
    </ol>
  );
}

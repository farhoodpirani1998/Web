import { useState, type DragEvent } from "react";

import { PermissionGate } from "@/components/ui/PermissionGate";

import { AchievementStatusControl } from "./AchievementStatusControl";
import type { CmsAchievement, CmsAchievementStatus } from "./types";

/**
 * One achievement row in `AchievementList`'s table. Reorder controls
 * (drag handle plus up/down buttons) only render when `canReorder` is
 * true — `AchievementList` only sets that when the status filter is
 * "همه". Up/down buttons exist alongside native HTML5 drag and drop
 * because dragging alone isn't keyboard accessible.
 */
export interface AchievementRowProps {
  achievement: CmsAchievement;
  index: number;
  rowCount: number;
  canReorder: boolean;
  isReordering: boolean;
  isUpdatingStatus: boolean;
  onEdit: (achievement: CmsAchievement) => void;
  onDeleteRequest: (achievement: CmsAchievement) => void;
  onChangeStatus: (achievement: CmsAchievement, status: CmsAchievementStatus) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export function AchievementRow({
  achievement,
  index,
  rowCount,
  canReorder,
  isReordering,
  isUpdatingStatus,
  onEdit,
  onDeleteRequest,
  onChangeStatus,
  onReorder,
}: AchievementRowProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  function handleDrop(event: DragEvent<HTMLTableRowElement>) {
    event.preventDefault();
    setIsDragOver(false);
    const fromIndex = Number(event.dataTransfer.getData("text/plain"));
    if (!Number.isNaN(fromIndex) && fromIndex !== index) {
      onReorder(fromIndex, index);
    }
  }

  return (
    <tr
      draggable={canReorder && !isReordering}
      onDragStart={
        canReorder
          ? (event) => {
              event.dataTransfer.setData("text/plain", String(index));
              event.dataTransfer.effectAllowed = "move";
            }
          : undefined
      }
      onDragOver={
        canReorder
          ? (event) => {
              event.preventDefault();
              setIsDragOver(true);
            }
          : undefined
      }
      onDragLeave={canReorder ? () => setIsDragOver(false) : undefined}
      onDrop={canReorder ? handleDrop : undefined}
      className={isDragOver ? "bg-slate-50" : undefined}
    >
      {canReorder ? (
        <td className="w-10 px-3 py-3 align-top">
          <PermissionGate permission="website.content:write">
            <div className="flex flex-col items-center gap-1">
              <span
                aria-hidden="true"
                title="برای مرتب‌سازی بکشید"
                className={`cursor-grab select-none text-slate-400 ${
                  isReordering ? "opacity-50" : ""
                }`}
              >
                ⠿
              </span>
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  disabled={isReordering || index === 0}
                  onClick={() => onReorder(index, index - 1)}
                  aria-label="انتقال به بالا"
                  className="text-xs leading-none text-slate-500 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  ▲
                </button>
                <button
                  type="button"
                  disabled={isReordering || index === rowCount - 1}
                  onClick={() => onReorder(index, index + 1)}
                  aria-label="انتقال به پایین"
                  className="text-xs leading-none text-slate-500 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  ▼
                </button>
              </div>
            </div>
          </PermissionGate>
        </td>
      ) : null}

      <td className="px-3 py-3 align-top">
        <span className="font-heading text-lg font-bold text-slate-900" dir="rtl">
          {achievement.value}
        </span>
      </td>

      <td className="px-3 py-3 align-top">
        <p className="line-clamp-2 font-medium text-slate-900" dir="rtl">
          {achievement.label.fa}
        </p>
        {achievement.label.en ? (
          <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{achievement.label.en}</p>
        ) : null}
      </td>

      <td className="px-3 py-3 align-top text-slate-600">
        {achievement.icon ? (
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs" dir="ltr">
            {achievement.icon}
          </span>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        )}
      </td>

      <td className="px-3 py-3 align-top">
        <AchievementStatusControl
          status={achievement.status}
          isUpdating={isUpdatingStatus}
          onChangeStatus={(status) => onChangeStatus(achievement, status)}
        />
      </td>

      <td className="px-3 py-3 text-right align-top">
        <div className="flex justify-end gap-2">
          <PermissionGate permission="website.content:write">
            <button
              type="button"
              onClick={() => onEdit(achievement)}
              className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              ویرایش
            </button>
          </PermissionGate>
          <PermissionGate permission="website.content:write">
            <button
              type="button"
              onClick={() => onDeleteRequest(achievement)}
              className="rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              حذف
            </button>
          </PermissionGate>
        </div>
      </td>
    </tr>
  );
}

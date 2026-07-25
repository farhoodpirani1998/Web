import { useState, type DragEvent } from "react";

import { PermissionGate } from "@/components/ui/PermissionGate";

import { StatisticStatusControl } from "./StatisticStatusControl";
import type { CmsStatistic, CmsStatisticStatus } from "./types";

/**
 * One Statistic row in `StatisticList`'s table. Reorder controls (drag
 * handle plus up/down buttons) only render when `canReorder` is true —
 * `StatisticList` only sets that when the status filter is "All", see
 * that file's comment for why. Up/down buttons exist alongside native
 * HTML5 drag and drop because dragging alone isn't keyboard accessible.
 *
 * Both drag and the up/down buttons are gated behind `content:write`
 * (in addition to `canReorder`), matching `StatisticsController.reorder`'s
 * own `@RequireCmsPermission(CONTENT_WRITE)`.
 */
export interface StatisticRowProps {
  statistic: CmsStatistic;
  index: number;
  rowCount: number;
  canReorder: boolean;
  isReordering: boolean;
  isUpdatingStatus: boolean;
  onEdit: (statistic: CmsStatistic) => void;
  onDeleteRequest: (statistic: CmsStatistic) => void;
  onChangeStatus: (statistic: CmsStatistic, status: CmsStatisticStatus) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export function StatisticRow({
  statistic,
  index,
  rowCount,
  canReorder,
  isReordering,
  isUpdatingStatus,
  onEdit,
  onDeleteRequest,
  onChangeStatus,
  onReorder,
}: StatisticRowProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  function handleDragStart(event: DragEvent<HTMLTableRowElement>) {
    event.dataTransfer.setData("text/plain", String(index));
    event.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(event: DragEvent<HTMLTableRowElement>) {
    event.preventDefault();
    setIsDragOver(true);
  }

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
      onDragStart={canReorder ? handleDragStart : undefined}
      onDragOver={canReorder ? handleDragOver : undefined}
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
                title="Drag to reorder"
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
                  aria-label="Move up"
                  className="text-xs leading-none text-slate-500 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  ▲
                </button>
                <button
                  type="button"
                  disabled={isReordering || index === rowCount - 1}
                  onClick={() => onReorder(index, index + 1)}
                  aria-label="Move down"
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
        <p className="line-clamp-2 font-medium text-slate-900" dir="rtl">
          {statistic.label.fa}
        </p>
        {statistic.label.en ? (
          <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{statistic.label.en}</p>
        ) : null}
      </td>

      <td className="px-3 py-3 align-top text-slate-600">
        {statistic.value}
        {statistic.suffix ? <span className="text-slate-400">{statistic.suffix}</span> : null}
      </td>

      <td className="px-3 py-3 align-top text-slate-600">
        {statistic.icon ? (
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">{statistic.icon}</span>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        )}
      </td>

      <td className="px-3 py-3 align-top">
        <StatisticStatusControl
          status={statistic.status}
          isUpdating={isUpdatingStatus}
          onChangeStatus={(status) => onChangeStatus(statistic, status)}
        />
      </td>

      <td className="px-3 py-3 text-right align-top">
        <div className="flex justify-end gap-2">
          <PermissionGate permission="website.content:write">
            <button
              type="button"
              onClick={() => onEdit(statistic)}
              className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Edit
            </button>
          </PermissionGate>
          <PermissionGate permission="website.content:write">
            <button
              type="button"
              onClick={() => onDeleteRequest(statistic)}
              className="rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          </PermissionGate>
        </div>
      </td>
    </tr>
  );
}

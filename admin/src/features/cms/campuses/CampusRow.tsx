import { useState, type DragEvent } from "react";

import { useMediaById } from "@/features/cms/media";
import { PermissionGate } from "@/components/ui/PermissionGate";

import { CampusScheduleControl } from "./CampusScheduleControl";
import { CampusStatusControl } from "./CampusStatusControl";
import type { CmsCampus, CmsCampusStatus } from "./types";

/**
 * One campus row in `CampusList`'s table. Combines two idioms from
 * sibling modules that neither has alone:
 *   - Drag handle plus up/down reorder buttons, same as
 *     `features/cms/teachers/TeacherRow.tsx`/`features/cms/faq/FaqRow.tsx`
 *     — only rendered when `canReorder` is true (see `CampusList`'s
 *     comment for why). Up/down buttons exist alongside native HTML5
 *     drag and drop because dragging alone isn't keyboard accessible.
 *   - Featured-image thumbnail (resolved via `media/useMediaById`,
 *     since the campus only carries `featuredImageMediaId`, never an
 *     embedded media object), status control, and schedule control
 *     plus a History button, same as
 *     `features/cms/events/EventRow.tsx`/`features/cms/teachers/TeacherRow.tsx`.
 *
 * Both drag/up-down and the write actions are gated behind
 * `content:write`, matching `CampusesController.reorder`'s/`update`'s
 * own `@RequireCmsPermission(CONTENT_WRITE)`.
 */
export interface CampusRowProps {
  campus: CmsCampus;
  index: number;
  rowCount: number;
  canReorder: boolean;
  isReordering: boolean;
  isUpdatingStatus: boolean;
  isUpdatingSchedule: boolean;
  onEdit: (campus: CmsCampus) => void;
  onDeleteRequest: (campus: CmsCampus) => void;
  onChangeStatus: (campus: CmsCampus, status: CmsCampusStatus) => void;
  onSchedule: (campus: CmsCampus, publishAt: string | null) => void;
  onViewHistory: (campus: CmsCampus) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export function CampusRow({
  campus,
  index,
  rowCount,
  canReorder,
  isReordering,
  isUpdatingStatus,
  isUpdatingSchedule,
  onEdit,
  onDeleteRequest,
  onChangeStatus,
  onSchedule,
  onViewHistory,
  onReorder,
}: CampusRowProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const { media, isLoading } = useMediaById(campus.featuredImageMediaId);

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

      <td className="w-16 px-3 py-3 align-top">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-50">
          {campus.featuredImageMediaId && isLoading ? (
            <span className="text-xs text-slate-400">…</span>
          ) : media ? (
            <img
              src={media.thumbnailUrl ?? media.url}
              alt={media.altText}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-xs text-slate-400">—</span>
          )}
        </div>
      </td>

      <td className="px-3 py-3 align-top">
        <p className="line-clamp-2 font-medium text-slate-900" dir="rtl">
          {campus.title.fa}
        </p>
        <p className="mt-0.5 text-xs text-slate-400">/campuses/{campus.slug}</p>
      </td>

      <td className="px-3 py-3 align-top text-slate-600">
        {campus.address ? (
          <span className="line-clamp-2 text-xs" dir="rtl">
            {campus.address.fa}
          </span>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        )}
      </td>

      <td className="px-3 py-3 align-top">
        <CampusStatusControl
          status={campus.status}
          isUpdating={isUpdatingStatus}
          onChangeStatus={(status) => onChangeStatus(campus, status)}
        />
      </td>

      <td className="px-3 py-3 align-top">
        <CampusScheduleControl
          publishAt={campus.publishAt}
          isUpdating={isUpdatingSchedule}
          onSchedule={(publishAt) => onSchedule(campus, publishAt)}
        />
      </td>

      <td className="px-3 py-3 text-right align-top">
        <div className="flex flex-wrap justify-end gap-2">
          <PermissionGate permission="website.revisions:view">
            <button
              type="button"
              onClick={() => onViewHistory(campus)}
              className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              History
            </button>
          </PermissionGate>
          <PermissionGate permission="website.content:write">
            <button
              type="button"
              onClick={() => onEdit(campus)}
              className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Edit
            </button>
          </PermissionGate>
          <PermissionGate permission="website.content:write">
            <button
              type="button"
              onClick={() => onDeleteRequest(campus)}
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

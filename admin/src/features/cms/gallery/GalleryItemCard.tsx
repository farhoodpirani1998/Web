import { useState, type DragEvent } from "react";

import { useMediaById } from "@/features/cms/media";
import { PermissionGate } from "@/components/ui/PermissionGate";

import { GalleryStatusControl } from "./GalleryStatusControl";
import type { CmsGalleryItem, CmsGalleryStatus } from "./types";

/**
 * One gallery item in `GalleryGrid`'s grid. Reorder controls (drag
 * handle plus up/down buttons) only render when `canReorder` is true —
 * `GalleryGrid` only sets that when the status filter is "All", see
 * that file's comment for why. Up/down buttons exist alongside native
 * HTML5 drag and drop because dragging alone isn't keyboard accessible
 * — same reasoning as `features/cms/faq/FaqRow.tsx`.
 *
 * Both drag and the up/down buttons are gated behind `content:write`
 * (in addition to `canReorder`), matching `GalleryController.reorder`'s
 * own `@RequireCmsPermission(CONTENT_WRITE)`.
 *
 * Resolves its own thumbnail via `media/useMediaById` — the item only
 * carries `imageMediaId`, never an embedded media object (see
 * `types.ts`'s comment).
 */
export interface GalleryItemCardProps {
  item: CmsGalleryItem;
  index: number;
  itemCount: number;
  canReorder: boolean;
  isReordering: boolean;
  isUpdatingStatus: boolean;
  onEdit: (item: CmsGalleryItem) => void;
  onDeleteRequest: (item: CmsGalleryItem) => void;
  onChangeStatus: (item: CmsGalleryItem, status: CmsGalleryStatus) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export function GalleryItemCard({
  item,
  index,
  itemCount,
  canReorder,
  isReordering,
  isUpdatingStatus,
  onEdit,
  onDeleteRequest,
  onChangeStatus,
  onReorder,
}: GalleryItemCardProps) {
  const { media, isLoading } = useMediaById(item.imageMediaId);
  const [isDragOver, setIsDragOver] = useState(false);

  function handleDragStart(event: DragEvent<HTMLDivElement>) {
    event.dataTransfer.setData("text/plain", String(index));
    event.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragOver(true);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragOver(false);
    const fromIndex = Number(event.dataTransfer.getData("text/plain"));
    if (!Number.isNaN(fromIndex) && fromIndex !== index) {
      onReorder(fromIndex, index);
    }
  }

  return (
    <div
      draggable={canReorder && !isReordering}
      onDragStart={canReorder ? handleDragStart : undefined}
      onDragOver={canReorder ? handleDragOver : undefined}
      onDragLeave={canReorder ? () => setIsDragOver(false) : undefined}
      onDrop={canReorder ? handleDrop : undefined}
      className={`flex flex-col overflow-hidden rounded-lg border ${
        isDragOver ? "border-slate-500 bg-slate-50" : "border-slate-200 bg-white"
      }`}
    >
      <div className="aspect-video w-full bg-slate-100">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-xs text-slate-400">…</div>
        ) : media ? (
          <img
            src={media.thumbnailUrl ?? media.url}
            alt={media.altText}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-slate-400">
            No image
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        {item.caption?.fa ? (
          <p className="line-clamp-2 text-sm font-medium text-slate-900" dir="rtl">
            {item.caption.fa}
          </p>
        ) : (
          <p className="text-sm text-slate-400">No caption</p>
        )}

        {item.category ? (
          <span className="w-fit rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">
            {item.category}
          </span>
        ) : null}

        <GalleryStatusControl
          status={item.status}
          isUpdating={isUpdatingStatus}
          onChangeStatus={(status) => onChangeStatus(item, status)}
        />

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          {canReorder ? (
            <PermissionGate permission="website.content:write">
              <div className="flex items-center gap-1">
                <span
                  aria-hidden="true"
                  title="Drag to reorder"
                  className={`cursor-grab select-none text-slate-400 ${
                    isReordering ? "opacity-50" : ""
                  }`}
                >
                  ⠿
                </span>
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
                  disabled={isReordering || index === itemCount - 1}
                  onClick={() => onReorder(index, index + 1)}
                  aria-label="Move down"
                  className="text-xs leading-none text-slate-500 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  ▼
                </button>
              </div>
            </PermissionGate>
          ) : (
            <span />
          )}

          <div className="flex gap-2">
            <PermissionGate permission="website.content:write">
              <button
                type="button"
                onClick={() => onEdit(item)}
                className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Edit
              </button>
            </PermissionGate>
            <PermissionGate permission="website.content:write">
              <button
                type="button"
                onClick={() => onDeleteRequest(item)}
                className="rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </PermissionGate>
          </div>
        </div>
      </div>
    </div>
  );
}

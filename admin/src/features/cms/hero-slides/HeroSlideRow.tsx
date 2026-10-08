import { useState, type DragEvent } from "react";

import { useMediaById } from "@/features/cms/media";
import { PermissionGate } from "@/components/ui/PermissionGate";

import { HeroSlideStatusControl } from "./HeroSlideStatusControl";
import type { CmsHeroSlide, CmsHeroSlideStatus } from "./types";

/**
 * One hero slide row in `HeroSlideList`'s table. Reorder controls (drag
 * handle plus up/down buttons) only render when `canReorder` is true —
 * `HeroSlideList` only sets that when the status filter is "All", see
 * that file's comment for why. Up/down buttons exist alongside native
 * HTML5 drag and drop because dragging alone isn't keyboard accessible
 * — same reasoning as `features/cms/faq/FaqRow.tsx`.
 *
 * Both drag and the up/down buttons are gated behind `content:write`
 * (in addition to `canReorder`), matching `HeroController.reorder`'s
 * own `@RequireCmsPermission(CONTENT_WRITE)`.
 *
 * A table (like FAQ), not a grid (like Gallery) — a hero slide's
 * defining content is its heading/CTA text, with the background image
 * as supporting context, the reverse of Gallery where the photo is the
 * whole point. Resolves its own thumbnail via `media/useMediaById` —
 * the slide only carries `backgroundMediaId`, never an embedded media
 * object (see `types.ts`'s comment).
 *
 * Also renders a History button (gated behind `website.revisions:view`),
 * same as `features/cms/campuses/CampusRow.tsx`/
 * `features/cms/teachers/TeacherRow.tsx`.
 */
export interface HeroSlideRowProps {
  slide: CmsHeroSlide;
  index: number;
  rowCount: number;
  canReorder: boolean;
  isReordering: boolean;
  isUpdatingStatus: boolean;
  onEdit: (slide: CmsHeroSlide) => void;
  onDeleteRequest: (slide: CmsHeroSlide) => void;
  onChangeStatus: (slide: CmsHeroSlide, status: CmsHeroSlideStatus) => void;
  onViewHistory: (slide: CmsHeroSlide) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export function HeroSlideRow({
  slide,
  index,
  rowCount,
  canReorder,
  isReordering,
  isUpdatingStatus,
  onEdit,
  onDeleteRequest,
  onChangeStatus,
  onViewHistory,
  onReorder,
}: HeroSlideRowProps) {
  const { media, isLoading } = useMediaById(slide.backgroundMediaId);
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

      <td className="w-16 px-3 py-3 align-top">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-50">
          {slide.backgroundMediaId && isLoading ? (
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
          {slide.heading.fa}
        </p>
        {slide.heading.en ? (
          <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{slide.heading.en}</p>
        ) : null}
      </td>

      <td className="px-3 py-3 align-top text-slate-600">
        {slide.ctaLabel?.fa ? (
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs" dir="rtl">
            {slide.ctaLabel.fa}
          </span>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        )}
      </td>

      <td className="px-3 py-3 align-top">
        <HeroSlideStatusControl
          status={slide.status}
          isUpdating={isUpdatingStatus}
          onChangeStatus={(status) => onChangeStatus(slide, status)}
        />
      </td>

      <td className="px-3 py-3 text-right align-top">
        <div className="flex justify-end gap-2">
          <PermissionGate permission="website.revisions:view">
            <button
              type="button"
              onClick={() => onViewHistory(slide)}
              className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              History
            </button>
          </PermissionGate>
          <PermissionGate permission="website.content:write">
            <button
              type="button"
              onClick={() => onEdit(slide)}
              className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Edit
            </button>
          </PermissionGate>
          <PermissionGate permission="website.content:write">
            <button
              type="button"
              onClick={() => onDeleteRequest(slide)}
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

import { useState, type DragEvent } from "react";

import { useMediaById } from "@/features/cms/media";
import { PermissionGate } from "@/components/ui/PermissionGate";

import { TestimonialStatusControl } from "./TestimonialStatusControl";
import type { CmsTestimonial, CmsTestimonialStatus } from "./types";

/**
 * One testimonial row in `TestimonialList`'s table. Reorder controls
 * (drag handle plus up/down buttons) only render when `canReorder` is
 * true — `TestimonialList` only sets that when the status filter is
 * "All", same as `FaqRow`. Up/down buttons exist alongside native
 * HTML5 drag and drop because dragging alone isn't keyboard
 * accessible.
 *
 * Both drag and the up/down buttons are gated behind `content:write`
 * (in addition to `canReorder`), matching
 * `TestimonialsController.reorder`'s own
 * `@RequireCmsPermission(CONTENT_WRITE)`.
 *
 * The avatar thumbnail is resolved via `useMediaById`, same as
 * `TeacherAvatarField` — a small 32px circle here rather than the
 * larger 64px preview the form uses, since this is a dense table row.
 *
 * The selection checkbox (`selected`/`onToggleSelect`) is gated behind
 * `website.content:write`, same as Edit/Delete — see `NewsRow`'s
 * comment for the reasoning. It renders independently of `canReorder`:
 * selection makes sense whether or not the list is currently
 * reorderable.
 */
export interface TestimonialRowProps {
  testimonial: CmsTestimonial;
  index: number;
  rowCount: number;
  canReorder: boolean;
  isReordering: boolean;
  isUpdatingStatus: boolean;
  selected: boolean;
  onToggleSelect: (testimonial: CmsTestimonial) => void;
  onEdit: (testimonial: CmsTestimonial) => void;
  onDeleteRequest: (testimonial: CmsTestimonial) => void;
  onChangeStatus: (testimonial: CmsTestimonial, status: CmsTestimonialStatus) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export function TestimonialRow({
  testimonial,
  index,
  rowCount,
  canReorder,
  isReordering,
  isUpdatingStatus,
  selected,
  onToggleSelect,
  onEdit,
  onDeleteRequest,
  onChangeStatus,
  onReorder,
}: TestimonialRowProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const { media } = useMediaById(testimonial.avatarMediaId ?? null);

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
      className={isDragOver || selected ? "bg-slate-50" : undefined}
    >
      <td className="w-10 px-3 py-3 align-top">
        <PermissionGate permission="website.content:write">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggleSelect(testimonial)}
            aria-label={`Select testimonial from ${testimonial.authorName}`}
            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
          />
        </PermissionGate>
      </td>

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
        <div className="flex items-start gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50">
            {media ? (
              <img
                src={media.thumbnailUrl ?? media.url}
                alt={media.altText}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-[10px] text-slate-400">—</span>
            )}
          </div>
          <div>
            <p className="font-medium text-slate-900">{testimonial.authorName}</p>
            {testimonial.authorRole?.fa ? (
              <p className="text-xs text-slate-500" dir="rtl">
                {testimonial.authorRole.fa}
              </p>
            ) : null}
          </div>
        </div>
      </td>

      <td className="px-3 py-3 align-top">
        <p className="line-clamp-2 max-w-xs text-slate-600" dir="rtl">
          {testimonial.content.fa}
        </p>
      </td>

      <td className="px-3 py-3 align-top text-slate-600">
        {testimonial.rating ? (
          <span aria-label={`${testimonial.rating} out of 5`}>
            {"★".repeat(testimonial.rating)}
            <span className="text-slate-300">{"★".repeat(5 - testimonial.rating)}</span>
          </span>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        )}
      </td>

      <td className="px-3 py-3 align-top">
        <TestimonialStatusControl
          status={testimonial.status}
          isUpdating={isUpdatingStatus}
          onChangeStatus={(status) => onChangeStatus(testimonial, status)}
        />
      </td>

      <td className="px-3 py-3 text-right align-top">
        <div className="flex justify-end gap-2">
          <PermissionGate permission="website.content:write">
            <button
              type="button"
              onClick={() => onEdit(testimonial)}
              className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Edit
            </button>
          </PermissionGate>
          <PermissionGate permission="website.content:write">
            <button
              type="button"
              onClick={() => onDeleteRequest(testimonial)}
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

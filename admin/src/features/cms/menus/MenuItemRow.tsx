import { useState, type DragEvent } from "react";

import { PermissionGate } from "@/components/ui/PermissionGate";

import type { CmsMenuItem } from "./types";

/**
 * One menu item row within `MenuItemTree`. Reorder controls (drag
 * handle plus up/down buttons) are scoped to this item's sibling
 * group (same `parentId`) — `index`/`siblingCount` are positions
 * within that group, not the whole menu, matching the backend's own
 * per-parent reorder scoping (`MenuItemsService.reorder`).
 *
 * Same drag-and-drop-plus-up/down-buttons shape as
 * `features/cms/portal-links/PortalLinkRow.tsx` (buttons exist
 * alongside dragging because dragging alone isn't keyboard
 * accessible), and the same permission gating
 * (`website.content:write`, matching `MenuItemsController`'s
 * `@RequireCmsPermission(CONTENT_WRITE)` on reorder/update/remove).
 */
export interface MenuItemRowProps {
  item: CmsMenuItem;
  index: number;
  siblingCount: number;
  isReordering: boolean;
  isTogglingVisible: boolean;
  pageLabel?: string;
  onEdit: (item: CmsMenuItem) => void;
  onDeleteRequest: (item: CmsMenuItem) => void;
  onToggleVisible: (item: CmsMenuItem) => void;
  onAddChild: (item: CmsMenuItem) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export function MenuItemRow({
  item,
  index,
  siblingCount,
  isReordering,
  isTogglingVisible,
  pageLabel,
  onEdit,
  onDeleteRequest,
  onToggleVisible,
  onAddChild,
  onReorder,
}: MenuItemRowProps) {
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

  const linkSummary =
    item.linkType === "page" ? (pageLabel ?? "(page)") : (item.url ?? "");

  return (
    <div
      draggable={!isReordering}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      className={`flex items-start gap-3 rounded-md border border-slate-200 p-3 ${
        isDragOver ? "bg-slate-50" : "bg-white"
      }`}
    >
      <PermissionGate permission="website.content:write">
        <div className="flex shrink-0 flex-col items-center gap-1 pt-0.5">
          <span
            aria-hidden="true"
            title="Drag to reorder"
            className={`cursor-grab select-none text-slate-400 ${isReordering ? "opacity-50" : ""}`}
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
              disabled={isReordering || index === siblingCount - 1}
              onClick={() => onReorder(index, index + 1)}
              aria-label="Move down"
              className="text-xs leading-none text-slate-500 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30"
            >
              ▼
            </button>
          </div>
        </div>
      </PermissionGate>

      <div className="min-w-0 flex-1">
        <p className="font-medium text-slate-900" dir="rtl">
          {item.label.fa}
        </p>
        {item.label.en ? <p className="text-xs text-slate-500">{item.label.en}</p> : null}
        <p className="mt-0.5 truncate text-xs text-slate-500">
          {item.linkType === "page" ? "Page: " : "External: "}
          {linkSummary}
        </p>
      </div>

      <PermissionGate
        permission="website.content:write"
        fallback={
          <span
            className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-medium ${
              item.visible ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
            }`}
          >
            {item.visible ? "Visible" : "Hidden"}
          </span>
        }
      >
        <button
          type="button"
          disabled={isTogglingVisible}
          onClick={() => onToggleVisible(item)}
          className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-60 ${
            item.visible ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
          }`}
        >
          {isTogglingVisible ? "…" : item.visible ? "Visible" : "Hidden"}
        </button>
      </PermissionGate>

      <div className="flex shrink-0 flex-col items-end gap-2">
        <PermissionGate permission="website.content:write">
          <button
            type="button"
            onClick={() => onAddChild(item)}
            className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Add child
          </button>
        </PermissionGate>
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
  );
}

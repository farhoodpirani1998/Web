import { useState, type DragEvent } from "react";

import { PermissionGate } from "@/components/ui/PermissionGate";

import type { CmsPortalLink } from "./types";

/**
 * One portal link row in `PortalLinkList`'s table. Reorder controls
 * (drag handle plus up/down buttons) always render — unlike
 * `FaqRow`, there's no status filter that could show a partial list
 * (see `types.ts` — Portal Links has no draft/published/archived
 * lifecycle), so the full ordered list is always what's on screen and
 * reordering is always safe. Up/down buttons exist alongside native
 * HTML5 drag and drop because dragging alone isn't keyboard
 * accessible — same reasoning as `FaqRow`.
 *
 * Both drag and the up/down buttons, plus the visible toggle and
 * edit/delete actions, are gated behind `content:write`, matching
 * `PortalLinksController`'s own `@RequireCmsPermission(CONTENT_WRITE)`
 * on `reorder`/`update`/`remove`.
 */
export interface PortalLinkRowProps {
  link: CmsPortalLink;
  index: number;
  rowCount: number;
  isReordering: boolean;
  isTogglingVisible: boolean;
  onEdit: (link: CmsPortalLink) => void;
  onDeleteRequest: (link: CmsPortalLink) => void;
  onToggleVisible: (link: CmsPortalLink) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export function PortalLinkRow({
  link,
  index,
  rowCount,
  isReordering,
  isTogglingVisible,
  onEdit,
  onDeleteRequest,
  onToggleVisible,
  onReorder,
}: PortalLinkRowProps) {
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
      draggable={!isReordering}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      className={isDragOver ? "bg-slate-50" : undefined}
    >
      <td className="w-10 px-3 py-3 align-top">
        <PermissionGate permission="website.content:write">
          <div className="flex flex-col items-center gap-1">
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

      <td className="px-3 py-3 align-top">
        <p className="font-medium text-slate-900" dir="rtl">
          {link.label.fa}
        </p>
        {link.label.en ? <p className="mt-0.5 text-xs text-slate-500">{link.label.en}</p> : null}
      </td>

      <td className="max-w-xs truncate px-3 py-3 align-top text-slate-600">
        <a href={link.url} target="_blank" rel="noreferrer" className="hover:underline">
          {link.url}
        </a>
      </td>

      <td className="px-3 py-3 align-top">
        <PermissionGate
          permission="website.content:write"
          fallback={
            <span
              className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                link.visible ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
              }`}
            >
              {link.visible ? "Visible" : "Hidden"}
            </span>
          }
        >
          <button
            type="button"
            disabled={isTogglingVisible}
            onClick={() => onToggleVisible(link)}
            className={`rounded px-1.5 py-0.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-60 ${
              link.visible ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
            }`}
          >
            {isTogglingVisible ? "…" : link.visible ? "Visible" : "Hidden"}
          </button>
        </PermissionGate>
      </td>

      <td className="px-3 py-3 text-right align-top">
        <div className="flex justify-end gap-2">
          <PermissionGate permission="website.content:write">
            <button
              type="button"
              onClick={() => onEdit(link)}
              className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Edit
            </button>
          </PermissionGate>
          <PermissionGate permission="website.content:write">
            <button
              type="button"
              onClick={() => onDeleteRequest(link)}
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

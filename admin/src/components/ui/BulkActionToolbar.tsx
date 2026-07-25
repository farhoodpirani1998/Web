/**
 * Bulk action toolbar.
 *
 * CMS Bulk Actions sprint, Part 1 scope: the selection *shell* only.
 * Renders above a list's table (see `NewsList`/`PageList`/
 * `TestimonialList`) once at least one row is checked, and shows the
 * selected count plus a "Clear selection" control.
 *
 * `children` is where Part 2 will slot in the actual bulk-action
 * buttons (publish, unpublish, delete, …) once those exist — this
 * component only owns layout and the count/clear affordance, not any
 * action. Nothing here calls an API.
 */
import type { ReactNode } from "react";

export interface BulkActionToolbarProps {
  selectedCount: number;
  onClear: () => void;
  /** Slot for bulk-action buttons — left empty until Part 2 wires up real actions. */
  children?: ReactNode;
}

export function BulkActionToolbar({ selectedCount, onClear, children }: BulkActionToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      role="toolbar"
      aria-label="Bulk actions"
      className="flex flex-wrap items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
    >
      <span className="font-medium text-slate-900">
        {selectedCount} {selectedCount === 1 ? "item" : "items"} selected
      </span>

      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}

      <button
        type="button"
        onClick={onClear}
        className="ml-auto text-xs font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
      >
        Clear selection
      </button>
    </div>
  );
}

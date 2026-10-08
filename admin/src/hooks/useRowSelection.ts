import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * Tracks which rows of a list are checked, for the bulk-selection UI
 * shared by `NewsList`/`PageList`/`TestimonialList` (see
 * `components/ui/BulkActionToolbar.tsx` for the toolbar this feeds).
 *
 * Generic over the row type `T` so each feature can pass its own
 * entity (`CmsNewsArticle`, `CmsPage`, `CmsTestimonial`, …) plus a
 * `getId` accessor rather than this hook assuming a shape.
 *
 * Selection is keyed by id and intentionally *not* cleared on every
 * `items` change — only ids that disappear from `items` are pruned
 * (e.g. after a refetch swaps in a new page of results or a filter
 * changes what's shown). This keeps a selection intact across an
 * in-place update (e.g. a status badge re-rendering) while still
 * dropping ids that no longer exist, so a stale count can never be
 * shown for a row that's no longer on screen.
 *
 * This hook only owns the checkbox state — it has no idea what a
 * "bulk action" is. That's deliberate: Part 1 is selection UI only,
 * no bulk actions exist yet.
 */
export interface UseRowSelectionResult<T> {
  selectedIds: Set<string>;
  selectedCount: number;
  isSelected: (item: T) => boolean;
  toggle: (item: T) => void;
  toggleAll: () => void;
  clear: () => void;
  /** Removes just these ids from the selection, leaving the rest checked — see the implementation's comment for why. */
  deselectIds: (ids: string[]) => void;
  /** True when every currently-visible row is selected (and there's at least one row). */
  isAllSelected: boolean;
  /** True when some but not all currently-visible rows are selected — for the header checkbox's `indeterminate` state. */
  isIndeterminate: boolean;
}

export function useRowSelection<T>(
  items: T[],
  getId: (item: T) => string,
): UseRowSelectionResult<T> {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const visibleIds = useMemo(() => items.map(getId), [items, getId]);

  // Prune ids that fell out of view (filter change, refetch, delete)
  // so the count and header checkbox never reflect a row that's no
  // longer rendered.
  useEffect(() => {
    setSelectedIds((current) => {
      const visible = new Set(visibleIds);
      let changed = false;
      const next = new Set<string>();
      for (const id of current) {
        if (visible.has(id)) {
          next.add(id);
        } else {
          changed = true;
        }
      }
      return changed ? next : current;
    });
  }, [visibleIds]);

  const isSelected = useCallback((item: T) => selectedIds.has(getId(item)), [selectedIds, getId]);

  const toggle = useCallback(
    (item: T) => {
      const id = getId(item);
      setSelectedIds((current) => {
        const next = new Set(current);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    },
    [getId],
  );

  const toggleAll = useCallback(() => {
    setSelectedIds((current) => {
      const allSelected = visibleIds.length > 0 && visibleIds.every((id) => current.has(id));
      return allSelected ? new Set() : new Set(visibleIds);
    });
  }, [visibleIds]);

  const clear = useCallback(() => setSelectedIds(new Set()), []);

  /**
   * Removes specific ids from the selection without touching the rest
   * — for bulk actions (Part 2) that partially succeed: the ids that
   * succeeded should drop out of the selection (mirroring "clear
   * selection after a successful action"), while ids that failed stay
   * checked so the user can see what's left and retry.
   */
  const deselectIds = useCallback((ids: string[]) => {
    if (ids.length === 0) return;
    setSelectedIds((current) => {
      const next = new Set(current);
      for (const id of ids) next.delete(id);
      return next;
    });
  }, []);

  const isAllSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));
  const isIndeterminate = !isAllSelected && visibleIds.some((id) => selectedIds.has(id));

  return {
    selectedIds,
    selectedCount: selectedIds.size,
    isSelected,
    toggle,
    toggleAll,
    clear,
    deselectIds,
    isAllSelected,
    isIndeterminate,
  };
}

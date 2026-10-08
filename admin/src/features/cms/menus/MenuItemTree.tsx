import { EmptyState } from "@/components/ui/EmptyState";

import { MenuItemRow } from "./MenuItemRow";
import type { CmsMenuItem } from "./types";

/**
 * Renders `items` (the full flat list `useMenuItems` fetched for one
 * menu) as a tree, grouping by `parentId` and recursing into each
 * item's children — same "flat list in, tree assembled client-side"
 * approach the backend's own `MenuItemsService.findAll` doc comment
 * describes, done once here rather than per level.
 *
 * Each sibling group (items sharing the same `parentId`) is ordered by
 * `position` and reordered independently — `onReorder` is called with
 * that group's `parentId` plus the from/to indices *within that
 * group*, matching the backend's per-parent reorder scoping
 * (`MenuItemsService.reorder`/`ReorderMenuItemsDto`). `MenusPage` owns
 * translating that into a `reorderMenuItems` call.
 */
export interface MenuItemTreeProps {
  items: CmsMenuItem[];
  parentId: string | undefined;
  depth: number;
  isReordering: boolean;
  togglingVisibleId: string | null;
  pageLabelsById: Map<string, string>;
  onEdit: (item: CmsMenuItem) => void;
  onDeleteRequest: (item: CmsMenuItem) => void;
  onToggleVisible: (item: CmsMenuItem) => void;
  onAddChild: (item: CmsMenuItem) => void;
  onReorder: (parentId: string | undefined, fromIndex: number, toIndex: number) => void;
}

export function MenuItemTree({
  items,
  parentId,
  depth,
  isReordering,
  togglingVisibleId,
  pageLabelsById,
  onEdit,
  onDeleteRequest,
  onToggleVisible,
  onAddChild,
  onReorder,
}: MenuItemTreeProps) {
  const siblings = items
    .filter((item) => item.parentId === parentId)
    .sort((a, b) => a.position - b.position);

  if (siblings.length === 0) {
    if (depth === 0) {
      return (
        <EmptyState
          title="No items in this menu yet"
          description="Add a top-level item to start building this menu's navigation."
        />
      );
    }
    return null;
  }

  return (
    <div className={depth === 0 ? "flex flex-col gap-2" : "mt-2 flex flex-col gap-2 border-l border-slate-200 pl-4"}>
      {siblings.map((item, index) => (
        <div key={item.id}>
          <MenuItemRow
            item={item}
            index={index}
            siblingCount={siblings.length}
            isReordering={isReordering}
            isTogglingVisible={togglingVisibleId === item.id}
            pageLabel={item.pageId ? pageLabelsById.get(item.pageId) : undefined}
            onEdit={onEdit}
            onDeleteRequest={onDeleteRequest}
            onToggleVisible={onToggleVisible}
            onAddChild={onAddChild}
            onReorder={(fromIndex, toIndex) => onReorder(parentId, fromIndex, toIndex)}
          />
          <MenuItemTree
            items={items}
            parentId={item.id}
            depth={depth + 1}
            isReordering={isReordering}
            togglingVisibleId={togglingVisibleId}
            pageLabelsById={pageLabelsById}
            onEdit={onEdit}
            onDeleteRequest={onDeleteRequest}
            onToggleVisible={onToggleVisible}
            onAddChild={onAddChild}
            onReorder={onReorder}
          />
        </div>
      ))}
    </div>
  );
}

import { useMemo, useState } from "react";

import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageContainer } from "@/components/ui/PageContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { PermissionGate } from "@/components/ui/PermissionGate";
import { Section } from "@/components/ui/Section";
import { usePageOptions } from "@/features/cms/pages";
import { ApiError } from "@/lib/apiError";

import { reorderMenuItems, updateMenuItem } from "./api";
import { MenuDeleteConfirm } from "./MenuDeleteConfirm";
import { MenuForm } from "./MenuForm";
import { MenuItemDeleteConfirm } from "./MenuItemDeleteConfirm";
import { MenuItemForm } from "./MenuItemForm";
import { MenuItemTree } from "./MenuItemTree";
import { MenuList } from "./MenuList";
import { useMenuItems } from "./hooks/useMenuItems";
import { useMenus } from "./hooks/useMenus";
import type { CmsMenu, CmsMenuItem } from "./types";

/**
 * The Menus/MenuItems admin page (`/admin/menus`, wired via
 * `pages/MenusPage.tsx` — same "feature-owned UI, page file just
 * re-exports it" convention every other CMS module follows).
 *
 * Gated behind `website.content:read` for the entire page body,
 * matching `MenusController`/`MenuItemsController`'s own
 * `@RequireCmsPermission(CONTENT_READ)` on every GET. Write actions
 * are gated again at the control level (`MenuRow`/`MenuItemRow`), same
 * layered-gating approach `PortalLinksPage` uses.
 *
 * Two-panel layout: a Menu list on the left (`useMenus`), and the
 * selected menu's item tree on the right (`useMenuItems`, scoped to
 * `selectedMenuId`). Nothing here paginates or searches — same "plain
 * unbounded array" convention every other CMS list uses.
 */
export function MenusPage() {
  const { menus, isLoading: isLoadingMenus, error: menusError, refetch: refetchMenus } = useMenus();

  const [selectedMenuId, setSelectedMenuId] = useState<string | undefined>(undefined);
  const selectedMenu = menus.find((menu) => menu.id === selectedMenuId) ?? null;

  const {
    items,
    isLoading: isLoadingItems,
    error: itemsError,
    refetch: refetchItems,
    setItems,
  } = useMenuItems(selectedMenuId);

  const { options: pageOptions } = usePageOptions();
  const pageLabelsById = useMemo(() => {
    const map = new Map<string, string>();
    for (const page of pageOptions) {
      map.set(page.id, `${page.title.fa} (${page.slug})`);
    }
    return map;
  }, [pageOptions]);

  const [isMenuFormOpen, setIsMenuFormOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<CmsMenu | null>(null);
  const [pendingMenuDelete, setPendingMenuDelete] = useState<CmsMenu | null>(null);

  const [isItemFormOpen, setIsItemFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CmsMenuItem | null>(null);
  const [itemFormParentId, setItemFormParentId] = useState<string | undefined>(undefined);
  const [pendingItemDelete, setPendingItemDelete] = useState<CmsMenuItem | null>(null);

  const [togglingVisibleId, setTogglingVisibleId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  function handleCreateMenu() {
    setEditingMenu(null);
    setIsMenuFormOpen(true);
  }

  function handleEditMenu(menu: CmsMenu) {
    setEditingMenu(menu);
    setIsMenuFormOpen(true);
  }

  function handleMenuSaved(menu: CmsMenu) {
    setIsMenuFormOpen(false);
    setEditingMenu(null);
    refetchMenus();
    setSelectedMenuId(menu.id);
  }

  function handleMenuDeleted(id: string) {
    setPendingMenuDelete(null);
    if (selectedMenuId === id) setSelectedMenuId(undefined);
    refetchMenus();
  }

  function handleAddTopLevelItem() {
    setEditingItem(null);
    setItemFormParentId(undefined);
    setIsItemFormOpen(true);
  }

  function handleAddChildItem(parent: CmsMenuItem) {
    setEditingItem(null);
    setItemFormParentId(parent.id);
    setIsItemFormOpen(true);
  }

  function handleEditItem(item: CmsMenuItem) {
    setEditingItem(item);
    setItemFormParentId(item.parentId);
    setIsItemFormOpen(true);
  }

  function handleItemSaved() {
    setIsItemFormOpen(false);
    setEditingItem(null);
    refetchItems();
  }

  function handleItemDeleted() {
    setPendingItemDelete(null);
    refetchItems();
  }

  async function handleToggleItemVisible(item: CmsMenuItem) {
    setActionError(null);
    setTogglingVisibleId(item.id);

    try {
      const updated = await updateMenuItem(item.id, { visible: !item.visible });
      setItems((current) => current.map((entry) => (entry.id === updated.id ? updated : entry)));
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setTogglingVisibleId(null);
    }
  }

  async function handleReorder(parentId: string | undefined, fromIndex: number, toIndex: number) {
    if (!selectedMenuId || fromIndex === toIndex) return;

    const siblings = items
      .filter((item) => item.parentId === parentId)
      .sort((a, b) => a.position - b.position);
    if (toIndex < 0 || toIndex >= siblings.length) return;

    const reorderedSiblings = [...siblings];
    const [moved] = reorderedSiblings.splice(fromIndex, 1);
    reorderedSiblings.splice(toIndex, 0, moved);
    const orderedIds = reorderedSiblings.map((sibling) => sibling.id);

    // Optimistic: splice the reordered sibling group back into the
    // full flat list immediately, roll back on failure — same
    // reasoning as `PortalLinksPage.handleReorder`.
    const previous = items;
    const siblingIdSet = new Set(orderedIds);
    const positionById = new Map(orderedIds.map((id, index) => [id, index]));
    setItems((current) =>
      current.map((entry) =>
        siblingIdSet.has(entry.id) ? { ...entry, position: positionById.get(entry.id)! } : entry,
      ),
    );
    setActionError(null);
    setIsReordering(true);

    try {
      await reorderMenuItems(selectedMenuId, parentId, orderedIds);
    } catch (err) {
      setItems(previous);
      setActionError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsReordering(false);
    }
  }

  return (
    <PageContainer>
      <Breadcrumb items={[{ label: "Dashboard" }, { label: "Menus" }]} />

      <PermissionGate
        permission="website.content:read"
        fallback={
          <>
            <PageHeader title="Menus" />
            <Section>
              <EmptyState
                title="You don't have access to Menus"
                description="Viewing menus requires the Content permission. Contact an admin if you need access."
              />
            </Section>
          </>
        }
      >
        <PageHeader
          title="Menus"
          description="Manage site navigation menus (header, footer, etc.) and their entries."
        >
          <PermissionGate permission="website.content:write">
            <button
              type="button"
              onClick={handleCreateMenu}
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              New menu
            </button>
          </PermissionGate>
        </PageHeader>

        <Section>
          {actionError ? (
            <p role="alert" className="mb-4 text-sm text-red-600">
              {actionError}
            </p>
          ) : null}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
            <MenuList
              menus={menus}
              selectedMenuId={selectedMenuId}
              isLoading={isLoadingMenus}
              error={menusError}
              onSelect={(menu) => setSelectedMenuId(menu.id)}
              onEdit={handleEditMenu}
              onDeleteRequest={setPendingMenuDelete}
            />

            <div className="flex flex-col gap-4">
              {!selectedMenu ? (
                <EmptyState
                  title="Select a menu"
                  description="Choose a menu on the left to manage its items."
                />
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">{selectedMenu.name}</h3>
                      <p className="text-xs text-slate-500">{selectedMenu.key}</p>
                    </div>
                    <PermissionGate permission="website.content:write">
                      <button
                        type="button"
                        onClick={handleAddTopLevelItem}
                        className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                      >
                        New item
                      </button>
                    </PermissionGate>
                  </div>

                  {isLoadingItems ? (
                    <p className="py-8 text-center text-sm text-slate-500">Loading items…</p>
                  ) : itemsError ? (
                    <p className="py-8 text-center text-sm text-red-600">{itemsError.message}</p>
                  ) : (
                    <MenuItemTree
                      items={items}
                      parentId={undefined}
                      depth={0}
                      isReordering={isReordering}
                      togglingVisibleId={togglingVisibleId}
                      pageLabelsById={pageLabelsById}
                      onEdit={handleEditItem}
                      onDeleteRequest={setPendingItemDelete}
                      onToggleVisible={handleToggleItemVisible}
                      onAddChild={handleAddChildItem}
                      onReorder={handleReorder}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </Section>

        {isMenuFormOpen ? (
          <MenuForm
            menu={editingMenu}
            onCancel={() => setIsMenuFormOpen(false)}
            onSaved={handleMenuSaved}
          />
        ) : null}

        {pendingMenuDelete ? (
          <MenuDeleteConfirm
            menu={pendingMenuDelete}
            onCancel={() => setPendingMenuDelete(null)}
            onDeleted={handleMenuDeleted}
          />
        ) : null}

        {isItemFormOpen && selectedMenuId ? (
          <MenuItemForm
            menuId={selectedMenuId}
            siblingCandidates={items}
            item={editingItem}
            defaultParentId={itemFormParentId}
            onCancel={() => setIsItemFormOpen(false)}
            onSaved={handleItemSaved}
          />
        ) : null}

        {pendingItemDelete ? (
          <MenuItemDeleteConfirm
            item={pendingItemDelete}
            onCancel={() => setPendingItemDelete(null)}
            onDeleted={handleItemDeleted}
          />
        ) : null}
      </PermissionGate>
    </PageContainer>
  );
}

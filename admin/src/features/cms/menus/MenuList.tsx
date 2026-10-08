import { EmptyState } from "@/components/ui/EmptyState";
import type { ApiError } from "@/lib/apiError";

import { MenuRow } from "./MenuRow";
import type { CmsMenu } from "./types";

/**
 * Renders `useMenus`' result — `MenusPage` owns the hook; this
 * component only knows how to display whatever list/loading/error
 * state it's handed, same split as `features/cms/portal-links/PortalLinkList.tsx`.
 * No reorder column — unlike PortalLinks, `Menu` has no `position`
 * field (see `types.ts`; the backend orders menus by `createdAt`).
 */
export interface MenuListProps {
  menus: CmsMenu[];
  selectedMenuId: string | undefined;
  isLoading: boolean;
  error: ApiError | null;
  onSelect: (menu: CmsMenu) => void;
  onEdit: (menu: CmsMenu) => void;
  onDeleteRequest: (menu: CmsMenu) => void;
}

export function MenuList({
  menus,
  selectedMenuId,
  isLoading,
  error,
  onSelect,
  onEdit,
  onDeleteRequest,
}: MenuListProps) {
  if (isLoading) {
    return <p className="py-8 text-center text-sm text-slate-500">Loading menus…</p>;
  }

  if (error) {
    return <p className="py-8 text-center text-sm text-red-600">{error.message}</p>;
  }

  if (menus.length === 0) {
    return (
      <EmptyState
        title="No menus yet"
        description="Create a menu (e.g. “header” or “footer”) to start adding navigation entries."
      />
    );
  }

  return (
    <ul className="flex flex-col gap-1">
      {menus.map((menu) => (
        <MenuRow
          key={menu.id}
          menu={menu}
          isSelected={menu.id === selectedMenuId}
          onSelect={onSelect}
          onEdit={onEdit}
          onDeleteRequest={onDeleteRequest}
        />
      ))}
    </ul>
  );
}

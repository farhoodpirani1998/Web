/**
 * Public surface of the `cms/menus` feature.
 *
 * Other layers (pages, other CMS modules) should import from here
 * rather than reaching into `./api`, `./hooks/useMenus`, etc. directly
 * — same convention as `features/cms/portal-links/index.ts`.
 */
export type {
  CmsMenu,
  CmsMenuItem,
  CmsMenuItemLinkType,
  CreateMenuItemPayload,
  CreateMenuPayload,
  UpdateMenuItemPayload,
  UpdateMenuPayload,
} from "./types";
export {
  fetchMenuList,
  fetchMenuById,
  createMenu,
  updateMenu,
  deleteMenu,
  fetchMenuItemList,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  reorderMenuItems,
} from "./api";
export { useMenus, type UseMenusResult } from "./hooks/useMenus";
export { useMenuItems, type UseMenuItemsResult } from "./hooks/useMenuItems";

export { MenusPage } from "./MenusPage";
export { MenuList, type MenuListProps } from "./MenuList";
export { MenuRow, type MenuRowProps } from "./MenuRow";
export { MenuForm, type MenuFormProps } from "./MenuForm";
export { MenuDeleteConfirm, type MenuDeleteConfirmProps } from "./MenuDeleteConfirm";
export { MenuItemTree, type MenuItemTreeProps } from "./MenuItemTree";
export { MenuItemRow, type MenuItemRowProps } from "./MenuItemRow";
export { MenuItemForm, type MenuItemFormProps } from "./MenuItemForm";
export { MenuItemDeleteConfirm, type MenuItemDeleteConfirmProps } from "./MenuItemDeleteConfirm";

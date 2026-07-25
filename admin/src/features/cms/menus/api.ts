import { apiClient } from "@/lib/apiClient";

import type {
  CmsMenu,
  CmsMenuItem,
  CreateMenuItemPayload,
  CreateMenuPayload,
  UpdateMenuItemPayload,
  UpdateMenuPayload,
} from "./types";

/**
 * Request functions for the CMS Admin Menus/MenuItems endpoints
 * (`backend/src/modules/website/content/navigation/menus.controller.ts`,
 * `@Controller('admin/menus')`, and
 * `.../navigation/menu-items.controller.ts`, `@Controller('admin/menu-items')`).
 *
 * Only this file is aware of the `/menus` and `/menu-items` URLs —
 * callers use these functions, never `apiClient` directly (same
 * convention as `features/cms/portal-links/api.ts`). Paths are bare
 * (`/menus`, not `/admin/menus`) since `apiClient`'s base URL already
 * points at `.../admin`.
 *
 * No pagination/search params: `GET /admin/menus` returns a plain
 * array with no filter support today, same as every other CMS list
 * endpoint.
 */

/** `GET /admin/menus`. Returns every menu on the site, ordered by creation. */
export async function fetchMenuList(): Promise<CmsMenu[]> {
  const response = await apiClient.get<CmsMenu[]>("/menus");
  return response.data;
}

/** `GET /admin/menus/:id`. Rejects with a `not-found` `ApiError` for a bad id. */
export async function fetchMenuById(id: string): Promise<CmsMenu> {
  const response = await apiClient.get<CmsMenu>(`/menus/${id}`);
  return response.data;
}

/** `POST /admin/menus`. */
export async function createMenu(payload: CreateMenuPayload): Promise<CmsMenu> {
  const response = await apiClient.post<CmsMenu>("/menus", payload);
  return response.data;
}

/** `PATCH /admin/menus/:id`. */
export async function updateMenu(id: string, payload: UpdateMenuPayload): Promise<CmsMenu> {
  const response = await apiClient.patch<CmsMenu>(`/menus/${id}`, payload);
  return response.data;
}

/**
 * `DELETE /admin/menus/:id`. Deletes the menu and every one of its
 * items in one backend transaction (`MenusService.remove`) — unlike a
 * static page's parent/child guard, there is no "move the items first"
 * step here.
 */
export async function deleteMenu(id: string): Promise<void> {
  await apiClient.delete(`/menus/${id}`);
}

/**
 * `GET /admin/menu-items?menuId=...`. `menuId` is required by the
 * backend (`ParseUUIDPipe` on a mandatory query param). Omitting
 * `parentId` returns every item in the menu, flat — the admin UI
 * assembles the parent/child tree client-side from `parentId`, same
 * convention `MenuItemsService.findAll`'s own doc comment describes.
 * Passing `parentId` narrows to just that one level (used for the
 * "reorder these siblings" case, not for the main tree fetch).
 */
export async function fetchMenuItemList(menuId: string, parentId?: string): Promise<CmsMenuItem[]> {
  const response = await apiClient.get<CmsMenuItem[]>("/menu-items", {
    params: parentId ? { menuId, parentId } : { menuId },
  });
  return response.data;
}

/** `POST /admin/menu-items`. New items are appended at the end of their sibling group. */
export async function createMenuItem(payload: CreateMenuItemPayload): Promise<CmsMenuItem> {
  const response = await apiClient.post<CmsMenuItem>("/menu-items", payload);
  return response.data;
}

/** `PATCH /admin/menu-items/:id`. */
export async function updateMenuItem(
  id: string,
  payload: UpdateMenuItemPayload,
): Promise<CmsMenuItem> {
  const response = await apiClient.patch<CmsMenuItem>(`/menu-items/${id}`, payload);
  return response.data;
}

/**
 * `DELETE /admin/menu-items/:id`. The backend rejects this with a
 * `409` (`ApiError.kind === "unknown"`, surfaced as its message) when
 * the item still has children — the caller must move or delete them
 * first, same as `PagesService.remove`'s own guard.
 */
export async function deleteMenuItem(id: string): Promise<void> {
  await apiClient.delete(`/menu-items/${id}`);
}

/**
 * `PATCH /admin/menu-items/reorder`. Reorders one sibling group at a
 * time — `orderedIds` must be exactly the current children of
 * `parentId` (or every top-level item, when `parentId` is omitted),
 * matching `ReorderMenuItemsDto`/`MenuItemsService.reorder`. Passing a
 * partial or cross-parent list is rejected by the backend.
 */
export async function reorderMenuItems(
  menuId: string,
  parentId: string | undefined,
  orderedIds: string[],
): Promise<void> {
  await apiClient.patch("/menu-items/reorder", { menuId, parentId, orderedIds });
}

/**
 * Types for the CMS Menus/MenuItems module, mirroring the backend
 * `Menu`/`MenuItem` entities and their DTOs
 * (`backend/src/modules/website/content/navigation/entities/*.ts`,
 * `.../navigation/dto/*.ts`). Same "mirror, don't import" reasoning as
 * `features/cms/portal-links/types.ts` — the admin frontend and the
 * NestJS backend are separate packages with no shared runtime code
 * path.
 *
 * `siteId` (present on both entities via `BaseSiteScopedEntity`) is
 * deliberately not modeled here, same call every other module's types
 * file makes — nothing in this admin frontend acts on it today.
 *
 * Neither Menu nor MenuItem has a `CmsPublishStatus` — a nav container
 * and its entries have no draft/published/archived lifecycle, only
 * MenuItem's plain `visible` toggle (mirrors `MenuItem.visible`'s own
 * doc comment).
 */

import type { CmsEntityMeta, Translatable } from "../types";

/** A named navigation slot (e.g. "header", "footer"). Mirrors `Menu`. */
export interface CmsMenu extends CmsEntityMeta {
  key: string;
  name: string;
}

/** Body for `POST /admin/menus`. Mirrors `CreateMenuDto`. */
export interface CreateMenuPayload {
  key: string;
  name: string;
}

/** Body for `PATCH /admin/menus/:id`. Mirrors `UpdateMenuDto`. */
export interface UpdateMenuPayload {
  key?: string;
  name?: string;
}

/** Mirrors `MenuItemLinkType` (backend). */
export type CmsMenuItemLinkType = "page" | "external";

/**
 * A single clickable entry in a Menu, forming a tree via `parentId`.
 * Mirrors `MenuItem`. Same "flat list, tree assembled client-side from
 * `parentId`" convention the backend's own `MenuItemsService.findAll`
 * doc comment describes.
 */
export interface CmsMenuItem extends CmsEntityMeta {
  menuId: string;
  /** References another item's `id` in the same menu. `undefined` for a top-level item. */
  parentId?: string;
  label: Translatable<string>;
  linkType: CmsMenuItemLinkType;
  /** Set when `linkType` is `"page"`. */
  pageId?: string;
  /** Set when `linkType` is `"external"`. */
  url?: string;
  /** Ordering among siblings sharing the same (menuId, parentId). */
  position: number;
  visible: boolean;
}

/** Body for `POST /admin/menu-items`. Mirrors `CreateMenuItemDto`. */
export interface CreateMenuItemPayload {
  menuId: string;
  parentId?: string;
  label: Translatable<string>;
  linkType: CmsMenuItemLinkType;
  pageId?: string;
  url?: string;
  visible?: boolean;
}

/** Body for `PATCH /admin/menu-items/:id`. Mirrors `UpdateMenuItemDto`. */
export interface UpdateMenuItemPayload {
  /** Explicit `null` moves the item back to top-level; `undefined` leaves it unchanged. */
  parentId?: string | null;
  label?: Translatable<string>;
  linkType?: CmsMenuItemLinkType;
  /** Explicit `null` clears it; `undefined` leaves it unchanged. */
  pageId?: string | null;
  /** Explicit `null` clears it; `undefined` leaves it unchanged. */
  url?: string | null;
  visible?: boolean;
}

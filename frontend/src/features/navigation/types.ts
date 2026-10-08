/**
 * Public API response types for the backend's **Navigation** content
 * module (Website Frontend Architecture §4, §8), consumed by this
 * feature's data-fetching hook (`./api`, `./useNavigation`).
 *
 * Two shapes live here:
 * - `PublicMenuItemNode`/`Translatable` mirror the real wire response
 *   from `GET /public/navigation/:key`
 *   (`backend/.../public-api/navigation/public-navigation.controller.ts`)
 *   — a tree, keyed by `href`/`position`/`linkType`, with a
 *   translatable `label`. Same "mirror, don't import" reasoning as
 *   the `statistics` feature's `types.ts`: the marketing frontend and
 *   the NestJS backend are separate packages with no shared runtime
 *   code path.
 * - `NavigationItem`/`Navigation` are the shape `Header`/
 *   `DesktopNavigation`/`MobileNavigation` already consume (`label`
 *   as a plain string, `url`, ascending `order`) — `./api.ts` adapts
 *   the wire shape into this one so those components need no changes.
 */

/** Local mirror of the backend kernel's `Translatable<T>` — `fa` required, `en` optional. */
export interface Translatable<T = string> {
  fa: T;
  en?: T;
}

/**
 * Wire shape of one node returned by `GET {publicApiBaseUrl}/navigation/:key`
 * (a nested tree — `children` holds nested dropdown/flyout entries).
 */
export interface PublicMenuItemNode {
  id: string;
  label: Translatable<string>;
  linkType: "page" | "external";
  href: string | null;
  position: number;
  children: readonly PublicMenuItemNode[];
}

export interface NavigationItem {
  /** Stable identifier, also usable as a React list key. */
  id: string;
  /** Human-readable label shown in the menu. */
  label: string;
  /** In-app path or absolute URL. */
  url: string;
  /** Ascending display order among sibling items. */
  order: number;
  /** Link target; defaults to "_self" behavior when omitted. */
  target?: "_self" | "_blank";
  /** Nested items, for a dropdown/flyout submenu. */
  children?: readonly NavigationItem[];
}

/**
 * Shape `useNavigation()` resolves to, after `./api.ts` adapts the raw
 * `PublicMenuItemNode[]` tree from `GET {publicApiBaseUrl}/navigation/:key`
 * into this flatter, component-facing form.
 */
export interface Navigation {
  items: readonly NavigationItem[];
}

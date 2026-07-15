/**
 * Public API response types for the backend's **Navigation** content
 * module (Website Frontend Architecture §4, §8), consumed by this
 * feature's data-fetching hook (`./api`, `./useNavigation`).
 *
 * This is a new feature folder (data layer only, Sprint "connect
 * frontend to backend"): the app shell currently renders navigation
 * from `src/app/shell/nav-data.ts`, a frontend-owned placeholder list
 * shaped the same way (`label` + `href`) as this eventual API data —
 * see that file's doc comment. Wiring `Header`/`DesktopNavigation`/
 * `MobileNavigation` to `useNavigation` is a later phase; this file
 * only prepares the fetching layer.
 */

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
 * Full shape returned by `GET {publicApiBaseUrl}/navigation`.
 */
export interface Navigation {
  items: readonly NavigationItem[];
}

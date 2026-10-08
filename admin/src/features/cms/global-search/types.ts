/**
 * Types for the CMS Admin Global Search / Command Palette feature
 * (Sprint — CMS UX: Global Search + Command Palette).
 *
 * Two kinds of result:
 *  - "nav" — a static destination, one entry per `ADMIN_NAV_ITEMS`
 *    (`routes/nav.config.ts`). Always searchable regardless of
 *    permissions/data, same as `AdminSidebar` itself renders the nav
 *    list unfiltered.
 *  - "content" — a specific CMS record (a News article, a Teacher,
 *    etc.) resolved from that module's own `fetch*List` function, see
 *    `contentSearchRegistry.ts`. Every module in this admin edits
 *    in-place via a dialog/panel on its own list page — there is no
 *    per-item detail route anywhere (`routes/paths.ts` has no `:id`
 *    patterns) — so a content result's `route` is always its module's
 *    list page, the same destination clicking that module in the
 *    sidebar would go to. "Direct navigation to the relevant admin
 *    page" (this sprint's scope) means that page, not a deep link
 *    into a specific row/dialog.
 */

export interface NavSearchResult {
  kind: "nav";
  /** `nav:<ADMIN_NAV_ITEMS id>` — unique across both result kinds. */
  id: string;
  title: string;
  route: string;
}

export interface ContentSearchResult {
  kind: "content";
  /** `<moduleId>:<entity id>` — unique across both result kinds. */
  id: string;
  /** Matches `SearchableModule.moduleId` in `contentSearchRegistry.ts` (e.g. "news", "teachers"). */
  moduleId: string;
  /** The module's nav label (e.g. "News", "Teachers") — rendered as the result's group heading. */
  moduleLabel: string;
  title: string;
  /** Status/visibility hint shown under the title (e.g. "Published", "Visible"). Not every module has one. */
  subtitle?: string;
  route: string;
}

export type GlobalSearchResult = NavSearchResult | ContentSearchResult;

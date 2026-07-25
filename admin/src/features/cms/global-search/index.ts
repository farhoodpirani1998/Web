/**
 * Public surface of the `cms/global-search` feature.
 *
 * Other layers (the admin layout shell) should import from here
 * rather than reaching into `./useGlobalSearch`, `./CommandPalette`,
 * etc. directly — same convention as every other
 * `features/cms/<module>/index.ts`.
 */
export { GlobalSearchProvider, useGlobalSearchContext } from "./GlobalSearchProvider";
export type { ContentSearchResult, GlobalSearchResult, NavSearchResult } from "./types";

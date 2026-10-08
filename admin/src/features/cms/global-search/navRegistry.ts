import { ADMIN_NAV_ITEMS } from "@/routes/nav.config";

import type { NavSearchResult } from "./types";

/**
 * Wraps `ADMIN_NAV_ITEMS` (the same list `AdminSidebar` renders) as
 * search results — nothing here duplicates the nav list, it's read
 * straight from `routes/nav.config.ts` so the palette can never drift
 * from the sidebar. Unfiltered by permission, same call
 * `AdminSidebar`'s own comment already makes: each destination page
 * gates its own content, the nav entry itself is always shown.
 */
export function getNavSearchResults(): NavSearchResult[] {
  return ADMIN_NAV_ITEMS.map((item) => ({
    kind: "nav",
    id: `nav:${item.id}`,
    title: item.label,
    route: item.route,
  }));
}

import { apiClient } from "@/shared/api";

import type { Navigation, NavigationItem, PublicMenuItemNode } from "./types";

/**
 * The menu `key` this app's header nav requests (Menu entity's
 * programmatic handle, e.g. "header"/"footer" — see the backend's
 * `Menu` entity doc comment). This app only ever renders one menu
 * slot today, so a single constant is enough; a second slot (footer,
 * etc.) would get its own `fetch*`/`use*` pair rather than a param
 * threaded through this one.
 */
const HEADER_MENU_KEY = "header";

/**
 * Request functions for the `navigation` feature's Public API
 * endpoint.
 *
 * Per §14/§30, this is the only file in the `navigation` feature aware
 * of the endpoint's URL — `useNavigation` and any future consumer call
 * `fetchNavigation`, never `apiClient` directly.
 *
 * The real endpoint (`GET /public/navigation/:key`) returns a nested
 * `PublicMenuItemNode[]` tree keyed by `href`/`position`, not the
 * `{ items }`-wrapped, `url`/`order`-keyed shape `Header`/
 * `DesktopNavigation`/`MobileNavigation` already expect — `toNavigation`
 * below adapts one into the other so those components need no changes.
 */
export async function fetchNavigation(): Promise<Navigation> {
  const response = await apiClient.get<readonly PublicMenuItemNode[]>(
    `/navigation/${HEADER_MENU_KEY}`,
  );
  return toNavigation(response.data);
}

/**
 * Adapts the raw menu tree into the flat `NavigationItem[]` shape
 * `Header` already sorts/renders. A node with `href: null` (the
 * controller's own "withhold rather than 404" case for a PAGE link
 * whose target isn't currently published/resolvable) is dropped
 * rather than passed through as a dead link.
 */
function toNavigation(nodes: readonly PublicMenuItemNode[]): Navigation {
  return { items: nodes.map(toNavigationItem).filter((item): item is NavigationItem => item !== null) };
}

function toNavigationItem(node: PublicMenuItemNode): NavigationItem | null {
  if (node.href === null) return null;

  const children = node.children
    .map(toNavigationItem)
    .filter((child): child is NavigationItem => child !== null);

  return {
    id: node.id,
    label: node.label.fa,
    url: resolveUrl(node),
    order: node.position,
    children: children.length > 0 ? children : undefined,
  };
}

/**
 * `PublicNavigationController.resolveHref` (backend, out of scope
 * here) returns a PAGE-linked item's bare slug path (`/${slug}`, or
 * `/` for the homepage) — not this app's actual static-page route,
 * `pages/:slug` (`router.tsx`'s `StaticPageDetailPage`). With no
 * backend change available, this adapter is the one place that
 * corrects a PAGE item's `href` into that route before `Header`/
 * `DesktopNavigation`/`MobileNavigation` ever see the url. The
 * homepage sentinel (`"/"`) passes through as-is, and EXTERNAL items
 * are untouched — same "mirror, don't own" boundary this file already
 * keeps for everything else.
 */
function resolveUrl(node: PublicMenuItemNode): string {
  const href = node.href as string;
  if (node.linkType !== "page" || href === "/") return href;
  return `/pages${href}`;
}

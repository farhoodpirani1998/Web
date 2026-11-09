/** Canonical public route patterns and helpers used by the router and links. */
export const ROUTE_PATHS = {
  library: "/library",
  textbookDetail: "/library/:slug",
} as const;

export function textbookPath(slug: string): string {
  return "/library/" + encodeURIComponent(slug);
}

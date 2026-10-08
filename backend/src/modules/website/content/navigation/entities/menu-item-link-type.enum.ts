/**
 * What a MenuItem points to. A fixed, small set — same philosophy as
 * PageTemplate: extend only when the frontend actually gains a new
 * link kind, not preemptively.
 *
 * - PAGE: internal, references an existing StaticPage via `pageId`.
 *   The public URL is derived from that page (slug/homepage) at read
 *   time, not duplicated onto the MenuItem — same reasoning as Page
 *   not storing its parent's path.
 * - EXTERNAL: an arbitrary absolute URL via `url` (another site, a
 *   PDF, a mailto: link, etc.) — not resolved against anything in
 *   this backend.
 */
export enum MenuItemLinkType {
  PAGE = 'page',
  EXTERNAL = 'external',
}

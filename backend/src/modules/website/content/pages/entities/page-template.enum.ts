/**
 * Fixed set of layout templates a page can render with on the public
 * site. A small enum, not a free-text field (unlike News/Faq's
 * `category`) and not its own manageable entity — the admin UI picks
 * from a known, code-defined list, same philosophy as the fixed
 * WebsiteRole -> permission map: this backend's needs are simple, so a
 * generic "manage your own templates" feature would be speculative
 * complexity. Extend this enum when the frontend actually gains a new
 * layout, not preemptively.
 */
export enum PageTemplate {
  DEFAULT = 'default',
  FULL_WIDTH = 'full_width',
  LANDING = 'landing',
  CONTACT = 'contact',
  SIDEBAR = 'sidebar',
}

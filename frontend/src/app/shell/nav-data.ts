/**
 * Frontend-owned fallback navigation for the app shell. `Header` uses
 * the CMS Navigation data when available and falls back to these
 * route-verified links if the request fails or returns no items.
 *
 * Only routes that actually exist in `router.tsx` are listed (§35 "does
 * not invent backend functionality" — the same principle applies to
 * inventing frontend routes). Add an entry here only once its route
 * exists.
 */

export interface NavItem {
  /** Frontend-owned UI chrome label (§28) — not CMS content. */
  label: string;
  /** In-app path, matching a route defined in `@/app/routes/router`. */
  href: string;
}

/**
 * Curated primary nav (visual-refresh pass, matching the approved
 * Figma navbar: five top-level items, not the full sitemap). The full
 * page list previously dumped every route — including an
 * internal-looking "تنظیمات سایت" entry and a "پیش‌ثبت‌نام" item that
 * duplicates the header's own CTA button — straight into the header,
 * which is the main reason the navbar read as cluttered rather than
 * intentional. Secondary pages (گالری، رویدادها، تقویم آموزشی، ...)
 * still exist and are reachable from the footer — they're just not
 * primary-nav-level anymore.
 */
export const NAV_ITEMS: readonly NavItem[] = [
  { label: "خانه", href: "/" },
  { label: "پردیس‌های آموزشی", href: "/campuses" },
  { label: "کادر آموزشی", href: "/teachers" },
  { label: "درباره ما", href: "/about" },
  { label: "تماس با ما", href: "/contact" },
];

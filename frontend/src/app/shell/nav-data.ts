/**
 * Shared navigation data for the app shell's `Header` (Sprint 3A).
 *
 * This is *not* the backend-owned Navigation content module (Website
 * Frontend Architecture §4, §8, §20) — that module doesn't exist on the
 * Public API yet, so there is nothing to fetch. Until it does, the shell
 * needs *some* structural nav to be keyboard/screen-reader verifiable,
 * so this file holds a small, frontend-owned placeholder list, shaped
 * the same way a future `useNavigation()` data hook's result would be
 * (`label` + `href`), so swapping this array for real API data later is
 * additive — `Header`/`DesktopNavigation`/`MobileNavigation` never need
 * to change, only where this array comes from.
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

export const NAV_ITEMS: readonly NavItem[] = [
  { label: "خانه", href: "/" },
  { label: "درباره ما", href: "/about" },
  { label: "شعب ما", href: "/schools" },
  { label: "اخبار", href: "/news" },
  { label: "گالری", href: "/gallery" },
  { label: "تماس با ما", href: "/contact" },
];

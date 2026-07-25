/**
 * Menus page — route glue only.
 *
 * The real Menus/MenuItems UI lives in
 * `features/cms/menus/MenusPage.tsx` — feature-owned UI belongs in the
 * feature folder, same convention `pages/PortalLinksPage.tsx` follows.
 * This file just re-exports it so `routes/index.tsx` can import a
 * stable `@/pages/MenusPage` regardless of how the feature folder
 * evolves.
 */
export { MenusPage } from "@/features/cms/menus";

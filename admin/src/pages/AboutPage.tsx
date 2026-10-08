/**
 * About page — route glue only.
 *
 * The real About module UI lives in
 * `features/cms/about/AboutPage.tsx` — feature-owned UI belongs in the
 * feature folder, same convention `pages/CampusesPage.tsx` follows
 * (see that file's comment). This file just re-exports it so
 * `routes/index.tsx` can import a stable `@/pages/AboutPage` regardless
 * of how the feature folder evolves.
 */
export { AboutPage } from "@/features/cms/about";

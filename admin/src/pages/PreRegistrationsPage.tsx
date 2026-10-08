/**
 * Pre-Registrations page — route glue only.
 *
 * The real Pre-Registrations UI lives in
 * `features/cms/pre-registrations/PreRegistrationsPage.tsx` — feature-
 * owned UI belongs in the feature folder, same convention
 * `pages/MenusPage.tsx`/`pages/PortalLinksPage.tsx` follow. This file
 * just re-exports it so `routes/index.tsx` can import a stable
 * `@/pages/PreRegistrationsPage` regardless of how the feature folder
 * evolves.
 */
export { PreRegistrationsPage } from "@/features/cms/pre-registrations";

/**
 * FAQ page — route glue only.
 *
 * The real FAQ module UI lives in `features/cms/faq/FaqPage.tsx` —
 * feature-owned UI belongs in the feature folder, same convention
 * `pages/MediaPage.tsx` follows for Media (see that file's comment).
 * This file just re-exports it so `routes/index.tsx` can import a
 * stable `@/pages/FaqPage` regardless of how the feature folder
 * evolves.
 */
export { FaqPage } from "@/features/cms/faq";

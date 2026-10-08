/**
 * Features page — route glue only.
 *
 * The real Features module UI lives in
 * `features/cms/features/FeaturesPage.tsx` — feature-owned UI belongs
 * in the feature folder, same convention `pages/FaqPage.tsx` follows
 * for FAQ (see that file's comment). This file just re-exports it so
 * `routes/index.tsx` can import a stable `@/pages/FeaturesPage`
 * regardless of how the feature folder evolves.
 */
export { FeaturesPage } from "@/features/cms/features";

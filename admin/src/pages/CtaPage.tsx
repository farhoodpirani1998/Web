/**
 * CTA page — route glue only.
 *
 * The real CTA module UI lives in `features/cms/cta/CtaPage.tsx` —
 * feature-owned UI belongs in the feature folder, same convention
 * `pages/AboutPage.tsx` follows (see that file's comment). This file
 * just re-exports it so `routes/index.tsx` can import a stable
 * `@/pages/CtaPage` regardless of how the feature folder evolves.
 */
export { CtaPage } from "@/features/cms/cta";

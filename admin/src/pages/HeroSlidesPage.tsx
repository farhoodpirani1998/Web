/**
 * Hero Slides page — route glue only.
 *
 * The real Hero Slides module UI lives in
 * `features/cms/hero-slides/HeroSlidesPage.tsx` — feature-owned UI
 * belongs in the feature folder, same convention `pages/FaqPage.tsx`/
 * `pages/GalleryPage.tsx` follow. This file just re-exports it so
 * `routes/index.tsx` can import a stable `@/pages/HeroSlidesPage`
 * regardless of how the feature folder evolves.
 */
export { HeroSlidesPage } from "@/features/cms/hero-slides";

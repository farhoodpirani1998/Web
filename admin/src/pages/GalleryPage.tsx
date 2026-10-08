/**
 * Gallery page — route glue only.
 *
 * The real Gallery module UI lives in `features/cms/gallery/GalleryPage.tsx`
 * — feature-owned UI belongs in the feature folder, same convention
 * `pages/FaqPage.tsx` follows for FAQ. This file just re-exports it so
 * `routes/index.tsx` can import a stable `@/pages/GalleryPage`
 * regardless of how the feature folder evolves.
 */
export { GalleryPage } from "@/features/cms/gallery";

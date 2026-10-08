/**
 * Testimonials page — route glue only.
 *
 * The real Testimonials module UI lives in
 * `features/cms/testimonials/TestimonialsPage.tsx` — feature-owned UI
 * belongs in the feature folder, same convention `pages/FaqPage.tsx`
 * follows for FAQ (see that file's comment). This file just re-exports
 * it so `routes/index.tsx` can import a stable
 * `@/pages/TestimonialsPage` regardless of how the feature folder
 * evolves.
 */
export { TestimonialsPage } from "@/features/cms/testimonials";

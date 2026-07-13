import { PageLayout, Stack } from "@/shared/design-system/components";
import { GalleryHero, GalleryGrid } from "@/features/gallery";

/**
 * Static "Gallery" page.
 *
 * Fixed singular page, route `/gallery`, following the same "fixed
 * singular page, not a slug-addressed static page" shape as
 * `AboutPage`/`ContactPage`/`SchoolsPage`/`NewsPage` (Website Frontend
 * Architecture §20 "Routing Strategy"). Photo data (image, caption,
 * category) is ultimately the backend's Gallery/Media content module
 * (§4, §8), but no such endpoint exists on the Public API yet, so per
 * the architecture's working rules this page renders frontend-owned
 * placeholder tiles only and fetches nothing.
 *
 * Each section is an extracted feature module (`@/features/gallery`),
 * following the same pattern as the homepage's `hero`/`features`/`cta`
 * features and the `about`/`contact`/`schools`/`news` pages —
 * `GalleryPage` only composes `<GalleryHero />` and `<GalleryGrid />`;
 * it owns no section's markup/copy itself. Swapping either for a
 * `useGallery()`-style data hook later is additive and stays entirely
 * inside that section's own feature file.
 *
 * Persian-first: copy is authored directly in Persian (the site's
 * Phase 1 locale, §28) rather than as English placeholder text, and the
 * layout relies on logical properties / direction-agnostic design
 * system primitives so it holds up under the app's `dir="rtl"` root
 * (`index.html`) as well as a future `ltr` locale.
 */
export function GalleryPage() {
  return (
    <PageLayout>
      <Stack gap="none">
        <GalleryHero />
        <GalleryGrid />
      </Stack>
    </PageLayout>
  );
}

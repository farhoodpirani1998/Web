import { PageLayout, Stack } from "@/shared/design-system/components";
import { GalleryHero, GalleryGrid, GalleryDetails, FAQ } from "@/features/gallery";

/**
 * Static "Gallery" page.
 *
 * Fixed singular page, route `/gallery`, following the same "fixed
 * singular page, not a slug-addressed static page" shape as
 * `AboutPage`/`ContactPage`/`SchoolsPage`/`NewsPage`/`CampusesPage`/
 * `TeachersPage` (Website Frontend Architecture §20 "Routing
 * Strategy"). Photo data (image, caption, category, description) is
 * ultimately the backend's Gallery/Media content module (§4, §8), but
 * no such endpoint exists on the Public API yet, so per the
 * architecture's working rules this page renders frontend-owned
 * placeholder tiles only and fetches nothing.
 *
 * Each section is an extracted feature module (`@/features/gallery`),
 * following the same pattern as the homepage's `hero`/`features`/`cta`
 * features and the `about`/`contact`/`schools`/`news`/`campuses`/
 * `teachers` pages — `GalleryPage` only composes these components; it
 * owns no section's markup/copy itself. Swapping any section for a
 * `useGallery()`-style data hook later is additive and stays entirely
 * inside that section's own feature file.
 *
 * `<GalleryHero />` and `<GalleryGrid />` are this page's original
 * two sections and are composed first, in their original order,
 * unchanged from before this extension. `<GalleryDetails />` and
 * `<FAQ />` are additive sections — the same "details" and "FAQ"
 * sections `CampusesPage`/`TeachersPage` already compose — appended
 * after them; route (`/gallery`), navigation entry, and every
 * previously-exported component keep working exactly as before.
 *
 * `GalleryCard` (the per-photo unit `GalleryGrid` repeats) and
 * `EmptyState` (the future "no results" view) are also part of
 * `@/features/gallery`'s public surface but are not composed here
 * directly — `GalleryCard` is used internally by `GalleryGrid`, and
 * `EmptyState` has no filter/search state to trigger it yet (see its
 * own file's doc comment).
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
        <GalleryDetails />
        <FAQ />
      </Stack>
    </PageLayout>
  );
}

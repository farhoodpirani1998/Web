import { PageLayout, Stack } from "@/shared/design-system/components";
import { Hero, CampusList, CampusDetails, FAQ } from "@/features/campuses";

/**
 * Static "Campuses" page.
 *
 * Fixed singular page, route `/campuses`, following the same "fixed
 * singular page, not a slug-addressed static page" shape as
 * `AboutPage`/`ContactPage`/`SchoolsPage`/`NewsPage`/`GalleryPage`/
 * `StatisticsPage`/`SitePage`/`PreRegistrationPage` (Website Frontend
 * Architecture §20 "Routing Strategy").
 *
 * This page is presentation-only scaffolding for the backend's future
 * Campuses content module (§4, §8) — no such endpoint exists on the
 * Public API yet, so every section renders frontend-owned, CMS-ready
 * placeholder copy and fetches nothing.
 *
 * Deliberately separate from `@/features/schools` / `SchoolsPage`
 * (route `/schools`): this Sprint's explicit scope is a new, isolated
 * feature and route — `SchoolsPage` is not replaced, renamed, or
 * modified by this work.
 *
 * Each section (Hero, CampusList, CampusDetails, FAQ) is its own
 * extracted feature module (`@/features/campuses`), following the
 * same pattern as the other static pages — `CampusesPage` only
 * composes these components; it owns no section's markup/copy itself.
 * Swapping any section for real data later is additive and stays
 * entirely inside that section's own feature file.
 *
 * `CampusCard` (the per-campus unit `CampusList` repeats) and
 * `EmptyState` (the future "no results" view) are also part of
 * `@/features/campuses`'s public surface but are not composed here
 * directly — `CampusCard` is used internally by `CampusList`, and
 * `EmptyState` has no filter/search state to trigger it yet (see its
 * own file's doc comment).
 *
 * Persian-first: copy is authored directly in Persian (the site's
 * Phase 1 locale, §28) rather than as English placeholder text, and the
 * layout relies on logical properties / direction-agnostic design
 * system primitives so it holds up under the app's `dir="rtl"` root
 * (`index.html`) as well as a future `ltr` locale.
 */
export function CampusesPage() {
  return (
    <PageLayout>
      <Stack gap="none">
        <Hero />
        <CampusList />
        <CampusDetails />
        <FAQ />
      </Stack>
    </PageLayout>
  );
}

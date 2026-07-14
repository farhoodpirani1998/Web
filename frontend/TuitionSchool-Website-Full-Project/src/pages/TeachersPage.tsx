import { PageLayout, Stack } from "@/shared/design-system/components";
import { Hero, TeacherGrid, TeacherDetails, FAQ } from "@/features/teachers";

/**
 * Static "Teachers" page.
 *
 * Fixed singular page, route `/teachers`, following the same "fixed
 * singular page, not a slug-addressed static page" shape as
 * `AboutPage`/`ContactPage`/`SchoolsPage`/`NewsPage`/`GalleryPage`/
 * `StatisticsPage`/`SitePage`/`PreRegistrationPage`/`CampusesPage`
 * (Website Frontend Architecture §20 "Routing Strategy").
 *
 * This page is presentation-only scaffolding for the backend's future
 * Teachers content module (§4, §8) — no such endpoint exists on the
 * Public API yet, so every section renders frontend-owned, CMS-ready
 * placeholder copy and fetches nothing.
 *
 * Deliberately isolated, matching the same "new, isolated feature"
 * scope `@/features/campuses` was built under — no other feature or
 * page is replaced, renamed, or modified by this work.
 *
 * Each section (Hero, TeacherGrid, TeacherDetails, FAQ) is its own
 * extracted feature module (`@/features/teachers`), following the
 * same pattern as `CampusesPage` — `TeachersPage` only composes these
 * components; it owns no section's markup/copy itself. Swapping any
 * section for real data later is additive and stays entirely inside
 * that section's own feature file.
 *
 * `TeacherCard` (the per-teacher unit `TeacherGrid` repeats) and
 * `EmptyState` (the future "no results" view) are also part of
 * `@/features/teachers`'s public surface but are not composed here
 * directly — `TeacherCard` is used internally by `TeacherGrid`, and
 * `EmptyState` has no filter/search state to trigger it yet (see its
 * own file's doc comment).
 *
 * Persian-first: copy is authored directly in Persian (the site's
 * Phase 1 locale, §28) rather than as English placeholder text, and the
 * layout relies on logical properties / direction-agnostic design
 * system primitives so it holds up under the app's `dir="rtl"` root
 * (`index.html`) as well as a future `ltr` locale.
 */
export function TeachersPage() {
  return (
    <PageLayout>
      <Stack gap="none">
        <Hero />
        <TeacherGrid />
        <TeacherDetails />
        <FAQ />
      </Stack>
    </PageLayout>
  );
}

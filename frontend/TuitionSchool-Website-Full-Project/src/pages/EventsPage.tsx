import { PageLayout, Stack } from "@/shared/design-system/components";
import { Hero, EventList, EventDetails, FAQ } from "@/features/events";

/**
 * Static "Events" page.
 *
 * Fixed singular page, route `/events`, following the same "fixed
 * singular page, not a slug-addressed static page" shape as
 * `AboutPage`/`ContactPage`/`SchoolsPage`/`NewsPage`/`GalleryPage`/
 * `StatisticsPage`/`SitePage`/`PreRegistrationPage`/`CampusesPage`/
 * `TeachersPage` (Website Frontend Architecture §20 "Routing
 * Strategy").
 *
 * This page is presentation-only scaffolding for the backend's future
 * Events content module (§4, §8) — no such endpoint exists on the
 * Public API yet, so every section renders frontend-owned, CMS-ready
 * placeholder copy and fetches nothing.
 *
 * Deliberately isolated, matching the same "new, isolated feature"
 * scope `@/features/campuses` and `@/features/teachers` were built
 * under — no other feature or page is replaced, renamed, or modified
 * by this work. This is also distinct from `@/features/news` (route
 * `/news`): news is editorial content, events are scheduled
 * date/time/location occurrences — neither replaces the other.
 *
 * Each section (Hero, EventList, EventDetails, FAQ) is its own
 * extracted feature module (`@/features/events`), following the same
 * pattern as `CampusesPage`/`TeachersPage` — `EventsPage` only
 * composes these components; it owns no section's markup/copy itself.
 * Swapping any section for real data later is additive and stays
 * entirely inside that section's own feature file.
 *
 * `EventCard` (the per-event unit `EventList` repeats) and
 * `EmptyState` (the future "no results" view) are also part of
 * `@/features/events`'s public surface but are not composed here
 * directly — `EventCard` is used internally by `EventList`, and
 * `EmptyState` has no filter/search state to trigger it yet (see its
 * own file's doc comment).
 *
 * Persian-first: copy is authored directly in Persian (the site's
 * Phase 1 locale, §28) rather than as English placeholder text, and the
 * layout relies on logical properties / direction-agnostic design
 * system primitives so it holds up under the app's `dir="rtl"` root
 * (`index.html`) as well as a future `ltr` locale.
 */
export function EventsPage() {
  return (
    <PageLayout>
      <Stack gap="none">
        <Hero />
        <EventList />
        <EventDetails />
        <FAQ />
      </Stack>
    </PageLayout>
  );
}

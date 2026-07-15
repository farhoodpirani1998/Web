import { PageLayout, Stack } from "@/shared/design-system/components";
import {
  Hero,
  YearOverview,
  Terms,
  Holidays,
  Exams,
  ImportantDates,
  FAQ,
} from "@/features/academic-calendar";

/**
 * Static "Academic Calendar" page.
 *
 * Fixed singular page, route `/academic-calendar`, following the same
 * "fixed singular page, not a slug-addressed static page" shape as
 * `AboutPage`/`ContactPage`/`SchoolsPage`/`NewsPage`/`GalleryPage`/
 * `StatisticsPage`/`SitePage`/`PreRegistrationPage`/`CampusesPage`/
 * `TeachersPage`/`EventsPage`/`AdmissionsPage` (Website Frontend
 * Architecture §20 "Routing Strategy").
 *
 * This page is presentation-only scaffolding for the backend's future
 * Academic Calendar content module (§4, §8) — no such endpoint exists
 * on the Public API yet, so every section renders frontend-owned,
 * CMS-ready placeholder copy and fetches nothing.
 *
 * Deliberately isolated, matching the same "new, isolated feature"
 * scope `@/features/campuses`/`@/features/teachers`/
 * `@/features/admissions` were built under — no other feature or page
 * is replaced, renamed, or modified by this work. In particular,
 * `@/features/events` (route `/events`) is not duplicated — it owns
 * one-off news/event listings; this page is the recurring, year-scoped
 * academic schedule (terms, holidays, exam windows).
 *
 * Each section (Hero, YearOverview, Terms, Holidays, Exams,
 * ImportantDates, FAQ) is its own extracted feature module
 * (`@/features/academic-calendar`), following the same pattern as the
 * other static pages — `AcademicCalendarPage` only composes these
 * components; it owns no section's markup/copy itself. Swapping any
 * section for real data later is additive and stays entirely inside
 * that section's own feature file.
 *
 * Persian-first: copy is authored directly in Persian (the site's
 * Phase 1 locale, §28) rather than as English placeholder text, and the
 * layout relies on logical properties / direction-agnostic design
 * system primitives so it holds up under the app's `dir="rtl"` root
 * (`index.html`) as well as a future `ltr` locale.
 */
export function AcademicCalendarPage() {
  return (
    <PageLayout>
      <Stack gap="none">
        <Hero />
        <YearOverview />
        <Terms />
        <Holidays />
        <Exams />
        <ImportantDates />
        <FAQ />
      </Stack>
    </PageLayout>
  );
}

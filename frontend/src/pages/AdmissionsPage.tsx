import { PageLayout, Stack } from "@/shared/design-system/components";
import {
  Hero,
  AdmissionSteps,
  Requirements,
  RequiredDocuments,
  TuitionOverview,
  FAQ,
  CTA,
} from "@/features/admissions";

/**
 * Static "Admissions" page.
 *
 * Fixed singular page, route `/admissions`, following the same "fixed
 * singular page, not a slug-addressed static page" shape as
 * `AboutPage`/`ContactPage`/`SchoolsPage`/`NewsPage`/`GalleryPage`/
 * `StatisticsPage`/`SitePage`/`PreRegistrationPage`/`CampusesPage`/
 * `TeachersPage`/`EventsPage` (Website Frontend Architecture §20
 * "Routing Strategy").
 *
 * The feature includes a Public API client and query hook, but these
 * page sections currently render their local content rather than
 * consuming that query.
 *
 * Deliberately isolated, matching the same "new, isolated feature"
 * scope `@/features/campuses`/`@/features/teachers`/`@/features/events`
 * were built under — no other feature or page is replaced, renamed, or
 * modified by this work. In particular, `@/features/pre-registration`
 * (route `/pre-registration`) is not duplicated — it owns the actual
 * registration form; this page is the informational process/
 * requirements/tuition page that funnels into it via `CTA`.
 *
 * Each section (Hero, AdmissionSteps, Requirements, RequiredDocuments,
 * TuitionOverview, FAQ, CTA) is its own extracted feature module
 * (`@/features/admissions`), following the same pattern as the other
 * static pages — `AdmissionsPage` only composes these components; it
 * owns no section's markup/copy itself. Swapping any section for real
 * data later is additive and stays entirely inside that section's own
 * feature file.
 *
 * Persian-first: copy is authored directly in Persian, and the
 * layout relies on logical properties / direction-agnostic design
 * system primitives so it holds up under the app's `dir="rtl"` root
 * (`index.html`) as well as a future `ltr` locale.
 */
export function AdmissionsPage() {
  return (
    <>
      {/* Hero and CTA are full-bleed bands, outside PageLayout (which is a
          Container); each opens its own Container internally. */}
      <Hero />
      <PageLayout>
        <Stack gap="none">
          <AdmissionSteps />
          <Requirements />
          <RequiredDocuments />
          <TuitionOverview />
          <FAQ />
        </Stack>
      </PageLayout>
      <CTA />
    </>
  );
}

import { PageLayout, Stack } from "@/shared/design-system/components";
import { Hero, Information, RegistrationForm, FAQ } from "@/features/pre-registration";

/**
 * Static "Pre-registration" page.
 *
 * Fixed singular page, route `/pre-registration`, following the same
 * "fixed singular page, not a slug-addressed static page" shape as
 * `AboutPage`/`ContactPage`/`SchoolsPage`/`NewsPage`/`GalleryPage`/
 * `StatisticsPage`/`SitePage` (Website Frontend Architecture §20
 * "Routing Strategy").
 *
 * This page is presentation-only scaffolding for the backend's future
 * Pre-registration content/submission module (§4, §8) — no such
 * endpoint exists on the Public API yet, so every section renders
 * frontend-owned, CMS-ready placeholder copy and fetches nothing.
 * `RegistrationForm` in particular is static markup only: no submit
 * handler, no client-side validation, no form state (see its own
 * file's doc comment).
 *
 * Each section (Hero, Information, RegistrationForm, FAQ) is its own
 * extracted feature module (`@/features/pre-registration`), following
 * the same pattern as the homepage's `hero`/`features`/`cta` features
 * and the other static pages — `PreRegistrationPage` only composes
 * these components; it owns no section's markup/copy itself. Swapping
 * any section for real data/submission logic later is additive and
 * stays entirely inside that section's own feature file.
 *
 * `SuccessState` (also part of `@/features/pre-registration`) is
 * deliberately not composed here — it is the future post-submission
 * view for once real submission logic exists, and has no trigger to
 * conditionally render on today.
 *
 * Persian-first: copy is authored directly in Persian (the site's
 * Phase 1 locale, §28) rather than as English placeholder text, and the
 * layout relies on logical properties / direction-agnostic design
 * system primitives so it holds up under the app's `dir="rtl"` root
 * (`index.html`) as well as a future `ltr` locale.
 */
export function PreRegistrationPage() {
  return (
    <PageLayout>
      <Stack gap="none">
        <Hero />
        <Information />
        <RegistrationForm />
        <FAQ />
      </Stack>
    </PageLayout>
  );
}

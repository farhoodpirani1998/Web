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
 * `Hero`, `Information`, and `FAQ` remain presentation-only, frontend-
 * owned placeholder copy — no Public API endpoint backs them yet.
 * `RegistrationForm` is the exception: it now submits to a real
 * endpoint (`POST /public/pre-registration`) and owns its own
 * submit/success/error state internally (see its own file's doc
 * comment) — this page still only composes it and doesn't need to
 * know about that state.
 *
 * Each section (Hero, Information, RegistrationForm, FAQ) is its own
 * extracted feature module (`@/features/pre-registration`), following
 * the same pattern as the homepage's `hero`/`features`/`cta` features
 * and the other static pages — `PreRegistrationPage` only composes
 * these components; it owns no section's markup/copy itself.
 *
 * `SuccessState` (also part of `@/features/pre-registration`) is not
 * composed here directly — `RegistrationForm` renders it internally in
 * place of the form on a successful submission (see its own doc
 * comment).
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

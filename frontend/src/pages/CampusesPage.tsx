import { PageLayout, Stack } from "@/shared/design-system/components";
import { Seo } from "@/shared/seo";
import { Hero, CampusList, CampusDetails, FAQ } from "@/features/campuses";

/**
 * The list page uses page-level SEO metadata; each campus detail route
 * uses the corresponding public campus detail response.
 */
const CAMPUSES_SEO = {
  title: "پردیس‌های آموزشی",
  description: "پردیس‌های آموزشی مجموعه و امکانات هر یک را ببینید.",
  canonicalUrl: `${window.location.origin}/campuses`,
  robots: "index, follow",
};

/**
 * Static "Campuses" page.
 *
 * Fixed singular page, route `/campuses`, following the same "fixed
 * singular page, not a slug-addressed static page" shape as
 * `AboutPage`/`ContactPage`/`SchoolsPage`/`NewsPage`/`GalleryPage`/
 * `StatisticsPage`/`SitePage`/`PreRegistrationPage` (Website Frontend
 * Architecture §20 "Routing Strategy").
 *
 * The campus list and detail content is backed by the existing public
 * Campuses API. Visitor-friendly `/schools` routes present the same
 * physical-campus records as schools.
 *
 * Kept as the established `/campuses` directory route alongside the
 * visitor-friendly `/schools` directory route.
 *
 * Each section (Hero, CampusList, CampusDetails, FAQ) is its own
 * extracted feature module (`@/features/campuses`), following the
 * same pattern as the other static pages — `CampusesPage` only
 * composes these components; it owns no section's markup/copy itself.
 * Campus query and response adaptation remain inside the campuses
 * feature.
 *
 * `CampusCard` and `EmptyState` are composed internally by
 * `CampusList`.
 *
 * Persian-first: copy is authored directly in Persian (the site's
 * current Persian locale) rather than as English placeholder text, and the
 * layout relies on logical properties / direction-agnostic design
 * system primitives so it holds up under the app's `dir="rtl"` root
 * (`index.html`) as well as a future `ltr` locale.
 */
export function CampusesPage() {
  return (
    <>
      <Seo seo={CAMPUSES_SEO} />
      {/* Full-bleed hero band, outside PageLayout (which is a Container). */}
      <Hero />
      <PageLayout>
        <Stack gap="none">
          <CampusList />
          <CampusDetails />
          <FAQ />
        </Stack>
      </PageLayout>
    </>
  );
}

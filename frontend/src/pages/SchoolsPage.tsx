import { PageLayout } from "@/shared/design-system/components";
import { CampusGlobe } from "@/features/about/CampusGlobe";
import { useCampuses } from "@/features/campuses";
import { SchoolsHero, SchoolsList } from "@/features/schools";

/**
 * Visitor-friendly "Schools" page backed by the existing Campuses
 * resource; a physical campus is a school's detail record.
 *
 * `/schools` and `/schools/:slug` remain available to visitors while
 * the list and detail content comes from the Campus API. No separate
 * School entity or endpoint is defined here.
 *
 * Fixed singular page, route `/schools`, following the same shape as
 * `AboutPage`/`ContactPage` (Website Frontend Architecture §20
 * "Routing Strategy"). Campus records supply the school's published
 * name, address, phone, imagery, grade levels, and other details.
 *
 * Each section is an extracted feature module (`@/features/schools`),
 * following the same pattern as the homepage's `hero`/`features`/`cta`
 * features and the `about`/`contact` pages — `SchoolsPage` only
 * composes `<SchoolsHero />` and `<SchoolsList />`; it owns no
 * section's markup/copy itself. The campuses feature owns the API and
 * query for this visitor-facing route.
 *
 * Persian-first: copy is authored directly in Persian (the site's
 * current Persian locale) rather than as English placeholder text, and the
 * layout relies on logical properties / direction-agnostic design
 * system primitives so it holds up under the app's `dir="rtl"` root
 * (`index.html`) as well as a future `ltr` locale.
 */
export function SchoolsPage() {
  const { data, isPending, isError } = useCampuses();

  return (
    <>
      {/* Full-bleed hero band, outside PageLayout (which is a Container). */}
      <SchoolsHero />

      <PageLayout>
        <div className="mb-8">
          <CampusGlobe
            campuses={data ?? []}
            isLoading={isPending}
            hasError={isError}
          />
        </div>

        <SchoolsList />
      </PageLayout>
    </>
  );
}

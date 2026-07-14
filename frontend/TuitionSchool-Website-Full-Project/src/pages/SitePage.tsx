import { PageLayout, Separator, Stack } from "@/shared/design-system/components";
import {
  GeneralWebsiteInformation,
  Brand,
  ContactInformation,
  WorkingHours,
  SocialLinks,
  Copyright,
} from "@/features/site";

/**
 * Static "Site" (Site Settings) page.
 *
 * Fixed singular page, route `/site`, following the same "fixed
 * singular page, not a slug-addressed static page" shape as
 * `AboutPage`/`ContactPage`/`SchoolsPage`/`NewsPage`/`GalleryPage`/
 * `StatisticsPage` (Website Frontend Architecture §20 "Routing
 * Strategy").
 *
 * This page is presentation-only scaffolding for the backend's **Site
 * Settings** content module (§4, §8) — the same category of data
 * `Header`/`Footer` chrome and the `contact` feature already reference
 * as a future `useSiteSettings()` data source. No such endpoint exists
 * on the Public API yet, so every section renders frontend-owned,
 * CMS-ready placeholder copy and fetches nothing.
 *
 * Each section (Brand, Contact Information, Social Links, Working
 * Hours, Copyright, General Website Information) is its own extracted
 * feature module (`@/features/site`), following the same pattern as
 * the homepage's `hero`/`features`/`cta` features and the other static
 * pages — `SitePage` only composes these components and the
 * `Separator` before `Copyright`; it owns no section's markup/copy
 * itself. Swapping any section for real Site Settings data later is
 * additive and stays entirely inside that section's own feature file.
 *
 * Persian-first: copy is authored directly in Persian (the site's
 * Phase 1 locale, §28) rather than as English placeholder text, and the
 * layout relies on logical properties / direction-agnostic design
 * system primitives so it holds up under the app's `dir="rtl"` root
 * (`index.html`) as well as a future `ltr` locale.
 */
export function SitePage() {
  return (
    <PageLayout>
      <Stack gap="none">
        <GeneralWebsiteInformation />
        <Brand />
        <ContactInformation />
        <WorkingHours />
        <SocialLinks />

        <Separator className="my-2" />

        <Copyright />
      </Stack>
    </PageLayout>
  );
}

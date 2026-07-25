import { PageLayout, Separator, Stack } from "@/shared/design-system/components";
import { Seo } from "@/shared/seo";
import {
  AboutHero,
  AboutStats,
  AboutStory,
  AboutValues,
  AboutTimeline,
  AboutTeam,
  AboutFAQ,
  useAboutPage,
} from "@/features/about";

/**
 * Static "About" page (Sprint 3B "Website Pages Foundation").
 *
 * This is a fixed singular page (Website Frontend Architecture §20
 * "Routing Strategy"), not a slug-addressed static page — its route is
 * `/about`, not `/pages/:slug`. A backend-owned Static Pages / About
 * content module now backs `GET /public/about` (`@/features/about`'s
 * `useAboutPage`); most sections still render frontend-owned
 * placeholder copy per-field (see `@/features/about/api.ts`'s
 * `toAboutPageContent`), but the page itself renders the shared
 * `<Seo />` component (`@/shared/seo`, §21) off that same query's
 * `seo`/`structuredData` fields.
 *
 * Each section (Hero, Stats, Story, Values, Timeline, Team, FAQ) is
 * now an extracted feature module (`@/features/about`), following the
 * same pattern as the homepage's `hero`/`features`/`cta` features —
 * `AboutPage` only composes these components and the `Separator`
 * between Timeline and Team; it no longer owns any section's
 * markup/copy. Swapping any section for a `useAboutPage()`-style data
 * hook later is additive and stays entirely inside that section's own
 * feature file.
 *
 * `AboutFAQ` closes the page, mirroring the trailing `FAQ` section
 * already established by `@/features/campuses`, `@/features/teachers`,
 * and `@/features/events` — the same native `<details>`/`<summary>`
 * disclosure pattern, kept feature-local until a third+ instance of
 * it graduates into a shared `Accordion` primitive.
 *
 * Persian-first: copy is authored directly in Persian (the site's
 * Phase 1 locale, §28) rather than as English placeholder text, and the
 * layout relies on logical properties / direction-agnostic design
 * system primitives so it holds up under the app's `dir="rtl"` root
 * (`index.html`) as well as a future `ltr` locale.
 */
export function AboutPage() {
  const { data } = useAboutPage();

  return (
    <PageLayout>
      <Seo seo={data?.seo} structuredData={data?.structuredData} />
      <Stack gap="none">
        <AboutHero />
        <AboutStats />
        <AboutStory />
        <AboutValues />
        <AboutTimeline />

        <Separator className="my-2" />

        <AboutTeam />
        <AboutFAQ />
      </Stack>
    </PageLayout>
  );
}

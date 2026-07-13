import { PageLayout, Separator, Stack } from "@/shared/design-system/components";
import {
  AboutHero,
  AboutStats,
  AboutStory,
  AboutValues,
  AboutTimeline,
  AboutTeam,
} from "@/features/about";

/**
 * Static "About" page (Sprint 3B "Website Pages Foundation").
 *
 * This is a fixed singular page (Website Frontend Architecture §20
 * "Routing Strategy"), not a slug-addressed static page — its route is
 * `/about`, not `/pages/:slug`. A backend-owned Static Pages / About
 * content module is a documented future data source (Product Rules
 * §content modules), but no such endpoint exists on the Public API yet,
 * so per the architecture's working rules this page renders
 * frontend-owned placeholder copy only and fetches nothing.
 *
 * Each section (Hero, Stats, Story, Values, Timeline, Team) is now an
 * extracted feature module (`@/features/about`), following the same
 * pattern as the homepage's `hero`/`features`/`cta` features —
 * `AboutPage` only composes these components and the `Separator`
 * between Timeline and Team; it no longer owns any section's
 * markup/copy. Swapping any section for a `useAboutPage()`-style data
 * hook later is additive and stays entirely inside that section's own
 * feature file.
 *
 * Persian-first: copy is authored directly in Persian (the site's
 * Phase 1 locale, §28) rather than as English placeholder text, and the
 * layout relies on logical properties / direction-agnostic design
 * system primitives so it holds up under the app's `dir="rtl"` root
 * (`index.html`) as well as a future `ltr` locale.
 */
export function AboutPage() {
  return (
    <PageLayout>
      <Stack gap="none">
        <AboutHero />
        <AboutStats />
        <AboutStory />
        <AboutValues />
        <AboutTimeline />

        <Separator className="my-2" />

        <AboutTeam />
      </Stack>
    </PageLayout>
  );
}

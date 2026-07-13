import { PageLayout, Stack } from "@/shared/design-system/components";
import { NewsHero, NewsList } from "@/features/news";

/**
 * Static "News" page.
 *
 * Fixed singular page, route `/news`, following the same "fixed
 * singular page, not a slug-addressed static page" shape as
 * `AboutPage`/`ContactPage`/`SchoolsPage` (Website Frontend
 * Architecture §20 "Routing Strategy"). News/announcement data (title,
 * date, category, body) is ultimately the backend's News content
 * module (§4, §8), but no such endpoint exists on the Public API yet,
 * so per the architecture's working rules this page renders
 * frontend-owned placeholder copy only and fetches nothing.
 *
 * Each section is an extracted feature module (`@/features/news`),
 * following the same pattern as the homepage's `hero`/`features`/`cta`
 * features and the `about`/`contact`/`schools` pages — `NewsPage` only
 * composes `<NewsHero />` and `<NewsList />`; it owns no section's
 * markup/copy itself. Swapping either for a `useNews()`-style data hook
 * later is additive and stays entirely inside that section's own
 * feature file.
 *
 * Persian-first: copy is authored directly in Persian (the site's
 * Phase 1 locale, §28) rather than as English placeholder text, and the
 * layout relies on logical properties / direction-agnostic design
 * system primitives so it holds up under the app's `dir="rtl"` root
 * (`index.html`) as well as a future `ltr` locale.
 */
export function NewsPage() {
  return (
    <PageLayout>
      <Stack gap="none">
        <NewsHero />
        <NewsList />
      </Stack>
    </PageLayout>
  );
}

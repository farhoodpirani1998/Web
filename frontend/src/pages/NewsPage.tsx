import { PageLayout, Stack } from "@/shared/design-system/components";
import { NewsHero, NewsList, NewsDetails, FAQ } from "@/features/news";

/**
 * Static "News" page.
 *
 * Fixed singular page, route `/news`, following the same "fixed
 * singular page, not a slug-addressed static page" shape as
 * `AboutPage`/`ContactPage`/`SchoolsPage`/`CampusesPage`/
 * `TeachersPage`/`GalleryPage` (Website Frontend Architecture §20
 * "Routing Strategy"). News/announcement data (title, date, category,
 * excerpt, body) is ultimately the backend's News content module
 * (§4, §8), but no such endpoint exists on the Public API yet, so per
 * the architecture's working rules this page renders frontend-owned
 * placeholder copy only and fetches nothing.
 *
 * Each section is an extracted feature module (`@/features/news`),
 * following the same pattern as the homepage's `hero`/`features`/`cta`
 * features and the `about`/`contact`/`schools`/`campuses`/`teachers`/
 * `gallery` pages — `NewsPage` only composes these components; it
 * owns no section's markup/copy itself. Swapping any section for a
 * `useNews()`-style data hook later is additive and stays entirely
 * inside that section's own feature file.
 *
 * `<NewsHero />` and `<NewsList />` are this page's original two
 * sections and are composed first, in their original order,
 * unchanged from before this extension. `<NewsDetails />` and
 * `<FAQ />` are additive sections — the same "details" and "FAQ"
 * sections `CampusesPage`/`TeachersPage`/`GalleryPage` already
 * compose — appended after them; route (`/news`), navigation entry,
 * and every previously-exported component keep working exactly as
 * before.
 *
 * `NewsCard` (the per-article unit `NewsList` repeats) and
 * `EmptyState` (the future "no results" view) are also part of
 * `@/features/news`'s public surface but are not composed here
 * directly — `NewsCard` is used internally by `NewsList`, and
 * `EmptyState` has no filter/search state to trigger it yet (see its
 * own file's doc comment).
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
        <NewsDetails />
        <FAQ />
      </Stack>
    </PageLayout>
  );
}

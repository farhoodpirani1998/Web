import { Grid, Heading, Section, Stack } from "@/shared/design-system/components";
import { NewsCard } from "./NewsCard";
import { newsItems } from "./data";

/**
 * News page "List" section — the news/announcement directory,
 * following the same pattern as `hero`/`features`/`cta`/`about`/
 * `contact`/`schools`, and now (as of this extension) also mirroring
 * `@/features/campuses`'s `CampusList`, `@/features/teachers`'s
 * `TeacherGrid`, and `@/features/gallery`'s `GalleryGrid`.
 *
 * Presentation only: composed from `Section`/`Stack`/`Grid` plus this
 * feature's own `NewsCard`, over the local `newsItems` literal
 * (`./data`) — no data fetching, no business logic. Swapping `./data`
 * for a `useNews()`-style data hook later is additive; this
 * component's JSX does not need to change.
 *
 * This is a refactor of where the six placeholder items and the
 * per-card markup live — extracted into `./data` and `./NewsCard`
 * respectively, matching the `campuses`/`teachers`/`gallery`
 * architecture — not a change to this component's public API: the
 * exported `NewsList` name, its section id (`news-list-heading`), and
 * the rendered output are unchanged, so every existing caller
 * (`NewsPage`, `@/features/news`'s `index.ts`) keeps working exactly
 * as before.
 *
 * There is deliberately no per-article route/link here (§7 — no
 * generic catch-all "render whatever this slug points to" route):
 * individual news-article pages aren't part of this feature's scope,
 * so cards link to `NewsDetails`'s on-page anchor, not a separate
 * route.
 */
export function NewsList() {
  return (
    <Section spacing="lg" aria-labelledby="news-list-heading">
      <Stack gap="md">
        <Heading id="news-list-heading" level={2}>
          فهرست اخبار
        </Heading>
        <Grid cols="3" gap="md">
          {newsItems.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </Grid>
      </Stack>
    </Section>
  );
}

import { Badge, Grid, Heading, Section, Stack, Text } from "@/shared/design-system/components";
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
 * Visual refresh: the heading now carries the same gold-badge/
 * underline eyebrow treatment the homepage `Features` section and
 * `GalleryGrid` already use, and `newsItems` is split into a "lead
 * story" (the first/most recent item, rendered full-width via
 * `NewsCard`'s `featured` layout) followed by the remaining items in a
 * 3-column grid — the same "one editorial lead + regular grid"
 * hierarchy premium news pages use, rather than six visually
 * identical tiles. `newsItems` itself is untouched (still assumed
 * newest-first, the same ordering `./data`'s doc comment already
 * describes); this only changes how the existing array is laid out on
 * screen.
 *
 * There is deliberately no per-article route/link here (§7 — no
 * generic catch-all "render whatever this slug points to" route):
 * individual news-article pages aren't part of this feature's scope,
 * so cards link to `NewsDetails`'s on-page anchor, not a separate
 * route.
 */
export function NewsList() {
  const [leadStory, ...restStories] = newsItems;

  return (
    <Section spacing="lg" aria-labelledby="news-list-heading">
      <Stack gap="xl">
        <Stack gap="sm" align="center" className="text-center">
          <Badge
            variant="outline"
            className="w-fit rounded-full border-brand-gold/40 bg-brand-gold/10 text-brand-navy"
          >
            آخرین مطالب
          </Badge>
          <Heading id="news-list-heading" level={2}>
            فهرست اخبار
          </Heading>
          <span aria-hidden="true" className="block h-1 w-16 rounded-full bg-brand-gold" />
          <Text variant="lead" className="max-w-2xl">
            تازه‌ترین اطلاعیه‌ها، رویدادها و دستاوردهای مجموعه را اینجا دنبال کنید.
          </Text>
        </Stack>

        <Stack gap="lg">
          {leadStory && <NewsCard item={leadStory} featured />}

          {restStories.length > 0 && (
            <Grid cols="3" gap="md">
              {restStories.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </Grid>
          )}
        </Stack>
      </Stack>
    </Section>
  );
}

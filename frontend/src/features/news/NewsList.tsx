import { Badge, Grid, Heading, Section, Stack, Text } from "@/shared/design-system/components";
import { NewsCard } from "./NewsCard";
import { newsItems } from "./data";
import { useNews } from "./useNews";

/**
 * News page "List" section — the news/announcement directory,
 * following the same pattern as `hero`/`features`/`cta`/`about`/
 * `contact`/`schools`, and now (as of this extension) also mirroring
 * `@/features/campuses`'s `CampusList`, `@/features/teachers`'s
 * `TeacherGrid`, and `@/features/gallery`'s `GalleryGrid`.
 *
 * Backed by `useNews()` (the Public API's News content module, §4,
 * §8): lays out `data.news` (assumed newest-first) when the query has
 * resolved with at least one item, and falls back to the local
 * `newsItems` placeholder array (`./data`) while the query is loading,
 * has errored, or the CMS has nothing published yet.
 *
 * Visual refresh: the heading now carries the same gold-badge/
 * underline eyebrow treatment the homepage `Features` section and
 * `GalleryGrid` already use, and the items are split into a "lead
 * story" (the first/most recent item, rendered full-width via
 * `NewsCard`'s `featured` layout) followed by the remaining items in a
 * 3-column grid — the same "one editorial lead + regular grid"
 * hierarchy premium news pages use, rather than uniform tiles.
 *
 * There is deliberately no per-article route/link here (§7 — no
 * generic catch-all "render whatever this slug points to" route):
 * individual news-article pages aren't part of this feature's scope,
 * so cards link to `NewsDetails`'s on-page anchor, not a separate
 * route.
 */
export function NewsList() {
  const { data } = useNews();
  const items = data && data.length > 0 ? data : newsItems;
  const [leadStory, ...restStories] = items;

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

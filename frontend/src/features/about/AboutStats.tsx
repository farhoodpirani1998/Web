import { Card, Grid, Heading, Section, Stack, Text } from "@/shared/design-system/components";
import { useAboutPage } from "./useAboutPage";
import type { AboutStatItem } from "./types";

/**
 * About page "Stats" section, following the same pattern as the
 * homepage's `hero`/`features`/`cta` features and now (as of this
 * extension) also `@/features/news`'s `NewsList`.
 *
 * Backed by `useAboutPage()` (the Public API's Static Pages/About
 * content module, §4, §8): lays out `data.stats` once the query has
 * resolved with at least one item, and falls back to the local
 * `fallbackStats` literal while the query is loading, has errored, or
 * the CMS has nothing published yet.
 *
 * Visual refresh: cards move from the plain `outline` variant to
 * `elevated` with a hover lift (the same treatment `GalleryCard`/
 * `NewsCard` use) plus a thin gold top accent bar, and the stat value
 * is bumped to a larger, `brand-gold`-toned numeral so the numbers
 * read as the section's visual anchor — the same "big number, small
 * label" hierarchy premium stat bands use, rather than same-weight
 * value/label text.
 */

const fallbackStats: readonly AboutStatItem[] = [
  { id: "founded", value: "۱۳۷۸", label: "سال تأسیس" },
  { id: "students", value: "+۱۲٬۰۰۰", label: "دانش‌آموز و دانشجو" },
  { id: "campuses", value: "۶", label: "شعبه فعال" },
  { id: "staff", value: "+۴۰۰", label: "مدرس و کارشناس" },
];

export function AboutStats() {
  const { data } = useAboutPage();
  const stats = data && data.stats.length > 0 ? data.stats : fallbackStats;

  return (
    <Section spacing="md" tone="muted" className="rounded-lg" aria-labelledby="about-stats-heading">
      <Stack gap="md">
        <Heading id="about-stats-heading" level={2} as="h3">
          مجموعه در یک نگاه
        </Heading>
        <Grid cols="4" gap="md">
          {stats.map((stat) => (
            <Card
              key={stat.id}
              variant="elevated"
              padding="md"
              className="group relative overflow-hidden bg-background text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-brand-gold" />
              <Stack gap="xs" align="center">
                <Text
                  as="span"
                  variant="body"
                  weight="bold"
                  className="font-heading text-3xl text-brand-gold lg:text-4xl"
                >
                  {stat.value}
                </Text>
                <Text variant="bodySm" color="muted">
                  {stat.label}
                </Text>
              </Stack>
            </Card>
          ))}
        </Grid>
      </Stack>
    </Section>
  );
}

import { Card, Grid, Heading, Section, Stack, Text } from "@/shared/design-system/components";
import { useStatistics } from "./useStatistics";
import type { StatisticItem } from "./types";

/**
 * Statistics page "Grid" section — the figures directory, following
 * the same pattern as `hero`/`features`/`cta`/`about`/`contact`/
 * `schools`/`news`/`gallery` (and specifically `AboutStats`, whose
 * card shape this reuses for a dedicated, more complete figures page),
 * and now (as of this extension) also `@/features/campuses`'s
 * `CampusList`.
 *
 * Backed by `useStatistics()` (the Public API's Statistics content
 * module, §4, §8): lays out `data` when the query has resolved with
 * at least one item, and falls back to the local `fallbackStats`
 * literal while the query is loading, has errored, or the CMS has
 * nothing published yet.
 *
 * Accessible by construction: each tile's figure and label are both
 * rendered as plain visible text (no information conveyed by color or
 * icon alone), and the number/label pairing reads correctly for screen
 * readers in document order regardless of the `dir="rtl"` visual flow.
 *
 * Brand pass: the section sits on `tone="muted"` so it reads as a
 * distinct band under `StatisticsHero` (the same alternating rhythm
 * `Features` uses against `Hero`/`CTA` on the homepage), tiles moved
 * from a plain outline card to the shared `elevated`/hover-lift
 * treatment `Features` already established, and each figure gets a
 * small gold accent rule to tie it back to the number above it —
 * still the same `Card` composition, just restyled.
 */

const fallbackStats: readonly StatisticItem[] = [
  { id: "founded", value: "۱۳۷۸", label: "سال تأسیس" },
  { id: "students", value: "+۱۲٬۰۰۰", label: "دانش‌آموز و دانشجو" },
  { id: "campuses", value: "۶", label: "شعبه فعال" },
  { id: "staff", value: "+۴۰۰", label: "مدرس و کارشناس" },
  { id: "graduates", value: "+۸٬۵۰۰", label: "فارغ‌التحصیل" },
  { id: "courses", value: "+۶۰", label: "دوره آموزشی" },
  { id: "satisfaction", value: "٪۹۶", label: "رضایت خانواده‌ها" },
  { id: "top-rank", value: "+۲۰۰", label: "رتبه برتر کنکور" },
];

export function StatisticsGrid() {
  const { data } = useStatistics();
  const stats = data && data.length > 0 ? data : fallbackStats;

  return (
    <Section spacing="lg" tone="muted" aria-labelledby="statistics-grid-heading">
      <Stack gap="lg">
        <Stack gap="xs" align="start">
          <Heading id="statistics-grid-heading" level={2}>
            آمار مجموعه
          </Heading>
          <span aria-hidden="true" className="block h-1 w-16 rounded-full bg-brand-gold" />
        </Stack>

        <Grid cols="4" gap="md">
          {stats.map((stat) => (
            <Card
              key={stat.id}
              variant="elevated"
              padding="lg"
              className="bg-background text-center transition-shadow duration-300 hover:shadow-lg"
            >
              <Stack gap="xs" align="center">
                <Text as="span" variant="lead" weight="bold" className="text-brand-navy">
                  {stat.value}
                </Text>
                <span aria-hidden="true" className="block h-0.5 w-8 rounded-full bg-brand-gold" />
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

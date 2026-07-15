import { Card, Grid, Heading, Section, Stack, Text } from "@/shared/design-system/components";

/**
 * Statistics page "Grid" section — the figures directory, following
 * the same pattern as `hero`/`features`/`cta`/`about`/`contact`/
 * `schools`/`news`/`gallery` (and specifically `AboutStats`, whose
 * card shape this reuses for a dedicated, more complete figures page).
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Section`, `Stack`, `Grid`, `Card`, `Heading`, `Text`) —
 * no data fetching, no business logic. Stat items are grouped into a
 * local array literal rather than interleaved in JSX (Website Frontend
 * Architecture §4, §8), so the eventual swap to a `useStatistics()`-
 * style data hook is a matter of replacing this literal — the layout
 * and design-system wiring below do not need to change. Real values
 * are ultimately the backend's Statistics content-module data; this
 * renders frontend-owned Persian placeholder copy in the meantime.
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

const stats = [
  { id: "founded", value: "۱۳۷۸", label: "سال تأسیس" },
  { id: "students", value: "+۱۲٬۰۰۰", label: "دانش‌آموز و دانشجو" },
  { id: "campuses", value: "۶", label: "شعبه فعال" },
  { id: "staff", value: "+۴۰۰", label: "مدرس و کارشناس" },
  { id: "graduates", value: "+۸٬۵۰۰", label: "فارغ‌التحصیل" },
  { id: "courses", value: "+۶۰", label: "دوره آموزشی" },
  { id: "satisfaction", value: "٪۹۶", label: "رضایت خانواده‌ها" },
  { id: "top-rank", value: "+۲۰۰", label: "رتبه برتر کنکور" },
] as const;

export function StatisticsGrid() {
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

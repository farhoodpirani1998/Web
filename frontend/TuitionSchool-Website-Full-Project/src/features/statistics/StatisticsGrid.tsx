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
    <Section spacing="lg" aria-labelledby="statistics-grid-heading">
      <Stack gap="md">
        <Heading id="statistics-grid-heading" level={2}>
          آمار مجموعه
        </Heading>
        <Grid cols="4" gap="md">
          {stats.map((stat) => (
            <Card key={stat.id} variant="outline" padding="md" className="text-center">
              <Stack gap="xs" align="center">
                <Text as="span" variant="lead" weight="bold" color="primary">
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

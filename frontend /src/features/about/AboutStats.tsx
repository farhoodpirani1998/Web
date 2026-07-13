import { Card, Grid, Heading, Section, Stack, Text } from "@/shared/design-system/components";

/**
 * About page "Stats" section — extracted from `AboutPage`'s inline
 * markup without changing layout, styling, or content, following the
 * same pattern as the homepage's `hero`/`features`/`cta` features.
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Section`, `Stack`, `Grid`, `Card`, `Heading`, `Text`) —
 * no data fetching, no business logic. Stat items are grouped into a
 * local array literal rather than interleaved in JSX (Website Frontend
 * Architecture §4, §8), so the eventual swap to a `useAboutPage()`-style
 * data hook is a matter of replacing this literal — the layout and
 * design-system wiring below do not need to change. Real values are
 * ultimately Static Pages/About content-module data; this renders
 * frontend-owned Persian placeholder copy in the meantime.
 */

const stats = [
  { id: "founded", value: "۱۳۷۸", label: "سال تأسیس" },
  { id: "students", value: "+۱۲٬۰۰۰", label: "دانش‌آموز و دانشجو" },
  { id: "campuses", value: "۶", label: "شعبه فعال" },
  { id: "staff", value: "+۴۰۰", label: "مدرس و کارشناس" },
] as const;

export function AboutStats() {
  return (
    <Section spacing="md" tone="muted" className="rounded-lg" aria-labelledby="about-stats-heading">
      <Stack gap="md">
        <Heading id="about-stats-heading" level={2} as="h3">
          مجموعه در یک نگاه
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

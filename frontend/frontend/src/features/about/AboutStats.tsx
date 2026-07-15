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
 *
 * Visual refresh: cards move from the plain `outline` variant to
 * `elevated` with a hover lift (the same treatment `GalleryCard`/
 * `NewsCard` use) plus a thin gold top accent bar, and the stat value
 * is bumped to a larger, `brand-gold`-toned numeral so the numbers
 * read as the section's visual anchor — the same "big number, small
 * label" hierarchy premium stat bands use, rather than same-weight
 * value/label text.
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

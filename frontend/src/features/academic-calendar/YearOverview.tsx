import {
  Card,
  Grid,
  Section,
  SectionHeader,
  Stack,
  Text,
} from "@/shared/design-system/components";
import { academicYearStats as fallbackStats } from "./data";
import { useAcademicCalendar } from "./useAcademicCalendar";

/**
 * Academic Calendar page "Year Overview" section — a snapshot of the
 * current academic year (start/end dates, term count, teaching
 * weeks), distinct from `Terms`'s per-term detail below it.
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Section`, `Stack`, `Grid`, `Card`, `Heading`, `Text`) —
 * no data fetching, no business logic. Stat items are grouped into a
 * local array literal (`./data`) rather than interleaved in JSX
 * (Website Frontend Architecture §4, §8), so swapping this for a
 * `useAcademicCalendar()`-style data hook later is a matter of
 * replacing that literal — this component's JSX does not need to
 * change. Real values are ultimately the backend's Academic Calendar
 * content-module data; this renders frontend-owned Persian
 * placeholder copy in the meantime.
 *
 * Visual refresh: cards move from the plain `outline` variant to
 * `elevated` with a hover lift plus a thin gold top accent bar — the
 * same "premium stat band" treatment `@/features/about`'s
 * `AboutStats` already established — and the stat value moves off the
 * shared `lead` scale onto a larger, `brand-gold`-toned numeral so the
 * numbers read as the section's visual anchor rather than same-weight
 * value/label text.
 */
export function YearOverview() {
  const { data } = useAcademicCalendar();
  const academicYearStats = data && data.yearStats.length > 0 ? data.yearStats : fallbackStats;

  return (
    <Section
      spacing="lg"
      tone="muted"
      className="rounded-3xl"
      aria-labelledby="academic-calendar-overview-heading"
    >
      <Stack gap="md">
        <SectionHeader
          headingId="academic-calendar-overview-heading"
          title="سال تحصیلی در یک نگاه"
          description="تاریخ‌های دقیق آغاز و پایان هر سال تحصیلی، تعداد ترم‌ها و هفته‌های آموزشی پس از انتشار در سامانه مدیریت محتوا در همین صفحه به‌روزرسانی می‌شود."
        />

        <Grid cols="4" gap="md">
          {academicYearStats.map((stat) => (
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
                  className="font-heading text-2xl text-brand-gold lg:text-3xl"
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

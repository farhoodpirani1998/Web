import {
  Card,
  Grid,
  Heading,
  Section,
  Stack,
  Text,
} from "@/shared/design-system/components";
import { academicYearStats } from "./data";

/**
 * Academic Calendar page "Year Overview" section — a snapshot of the
 * current academic year (start/end dates, term count, teaching
 * weeks), distinct from `Terms`'s per-term detail below it.
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Section`, `Stack`, `Grid`, `Card`, `Heading`, `Text`) —
 * no data fetching, no business logic. Reuses the same stat-card grid
 * pattern as `@/features/about`'s `AboutStats`. Stat items are grouped
 * into a local array literal (`./data`) rather than interleaved in
 * JSX (Website Frontend Architecture §4, §8), so swapping this for a
 * `useAcademicCalendar()`-style data hook later is a matter of
 * replacing that literal — this component's JSX does not need to
 * change. Real values are ultimately the backend's Academic Calendar
 * content-module data; this renders frontend-owned Persian
 * placeholder copy in the meantime.
 */
export function YearOverview() {
  return (
    <Section
      spacing="lg"
      tone="muted"
      className="rounded-lg"
      aria-labelledby="academic-calendar-overview-heading"
    >
      <Stack gap="md">
        <Stack gap="sm">
          <Heading id="academic-calendar-overview-heading" level={2}>
            سال تحصیلی در یک نگاه
          </Heading>
          <Text variant="lead" className="max-w-2xl">
            متن نمونه برای معرفی کلی سال تحصیلی جاری. تاریخ‌های دقیق آغاز و پایان هر
            سال تحصیلی هر ساله توسط مجموعه اعلام و در همین صفحه به‌روزرسانی می‌شود.
          </Text>
        </Stack>

        <Grid cols="4" gap="md">
          {academicYearStats.map((stat) => (
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

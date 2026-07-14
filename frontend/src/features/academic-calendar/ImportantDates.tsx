import { Heading, Section, Stack, Text } from "@/shared/design-system/components";
import { importantDates } from "./data";

/**
 * Academic Calendar page "Important Dates" section — key
 * registration, orientation, and ceremony dates that fall outside the
 * `Terms`/`Holidays`/`Exams` sections above.
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Section`, `Stack`, `Heading`, `Text`) — no data
 * fetching, no business logic. Reuses the same ordered-list pattern as
 * `Holidays` above and `@/features/about`'s `AboutTimeline` (a
 * semantic `<ol>` with a leading border, §26 — screen readers announce
 * entries in date order natively). Important dates are grouped into a
 * local array literal (`./data`) rather than interleaved in JSX
 * (Website Frontend Architecture §4, §8), so swapping this for a
 * `useAcademicCalendar()`-style data hook later is a matter of
 * replacing that literal — this component's JSX does not need to
 * change. Real dates are ultimately the backend's Academic Calendar
 * content-module data; this renders frontend-owned Persian
 * placeholder copy in the meantime.
 */
export function ImportantDates() {
  return (
    <Section
      spacing="lg"
      tone="muted"
      className="rounded-lg"
      aria-labelledby="academic-calendar-important-dates-heading"
    >
      <Stack gap="md">
        <Heading id="academic-calendar-important-dates-heading" level={2}>
          تاریخ‌های مهم
        </Heading>
        <Stack gap="none" as="ol" className="border-s border-border ps-6">
          {importantDates.map((item, index) => (
            <Stack
              key={item.id}
              as="li"
              gap="xs"
              className={
                index === importantDates.length - 1
                  ? "pb-0 pt-6 first:pt-0"
                  : "pb-6 pt-6 first:pt-0"
              }
            >
              <Text as="span" variant="overline" color="primary">
                {item.date}
              </Text>
              <Text as="span" weight="semibold">
                {item.title}
              </Text>
              <Text variant="bodySm" color="muted">
                {item.description}
              </Text>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Section>
  );
}

import { Heading, Section, Stack, Text } from "@/shared/design-system/components";
import { holidays } from "./data";

/**
 * Academic Calendar page "Holidays" section — official and religious
 * holidays observed during the academic year.
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Section`, `Stack`, `Heading`, `Text`) — no data
 * fetching, no business logic. Reuses the same ordered-list pattern as
 * `@/features/about`'s `AboutTimeline` (a semantic `<ol>` with a
 * leading border, §26 — screen readers announce entries in date
 * order natively), with each holiday's date rendered as an overline
 * label in place of a year. Holidays are grouped into a local array
 * literal (`./data`) rather than interleaved in JSX (Website Frontend
 * Architecture §4, §8), so swapping this for a
 * `useAcademicCalendar()`-style data hook later is a matter of
 * replacing that literal — this component's JSX does not need to
 * change. Real dates are ultimately the backend's Academic Calendar
 * content-module data; this renders frontend-owned Persian
 * placeholder copy in the meantime.
 */
export function Holidays() {
  return (
    <Section
      spacing="lg"
      tone="muted"
      className="rounded-lg"
      aria-labelledby="academic-calendar-holidays-heading"
    >
      <Stack gap="md">
        <Heading id="academic-calendar-holidays-heading" level={2}>
          تعطیلات رسمی و مذهبی
        </Heading>
        <Stack gap="none" as="ol" className="border-s border-border ps-6">
          {holidays.map((holiday, index) => (
            <Stack
              key={holiday.id}
              as="li"
              gap="xs"
              className={
                index === holidays.length - 1
                  ? "pb-0 pt-6 first:pt-0"
                  : "pb-6 pt-6 first:pt-0"
              }
            >
              <Text as="span" variant="overline" color="primary">
                {holiday.date}
              </Text>
              <Text as="span" weight="semibold">
                {holiday.name}
              </Text>
              <Text variant="bodySm" color="muted">
                {holiday.description}
              </Text>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Section>
  );
}

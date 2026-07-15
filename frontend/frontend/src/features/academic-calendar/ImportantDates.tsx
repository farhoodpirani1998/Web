import { Badge, Heading, Section, Stack, Text } from "@/shared/design-system/components";
import { importantDates } from "./data";

/**
 * Academic Calendar page "Important Dates" section — key
 * registration, orientation, and ceremony dates that fall outside the
 * `Terms`/`Holidays`/`Exams` sections above.
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Section`, `Stack`, `Badge`, `Heading`, `Text`) — no data
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
 *
 * Visual refresh: adopts the same gold-tinted timeline `AboutTimeline`/
 * `Holidays` already established — the plain `border-s` rule now
 * carries a gold tint and each entry gets a small gold dot marker
 * sitting on that line — and the date moves from a bare overline into
 * a navy/gold `Badge`, matching `Holidays`'s refresh above.
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
        <Stack gap="none" as="ol" className="border-s-2 border-brand-gold/30 ps-6">
          {importantDates.map((item, index) => (
            <Stack
              key={item.id}
              as="li"
              gap="xs"
              className={`relative ${
                index === importantDates.length - 1
                  ? "pb-0 pt-6 first:pt-0"
                  : "pb-6 pt-6 first:pt-0"
              }`}
            >
              <span
                aria-hidden="true"
                className="absolute -start-[1.875rem] top-7 h-3 w-3 rounded-full border-2 border-brand-gold bg-background"
              />
              <Badge variant="secondary" className="w-fit">
                {item.date}
              </Badge>
              <Text as="span" weight="semibold" className="font-heading">
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

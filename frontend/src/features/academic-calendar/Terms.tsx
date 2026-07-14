import { Badge, Heading, Section, Stack, Text } from "@/shared/design-system/components";
import { terms } from "./data";

/**
 * Academic Calendar page "Terms" section — the ordered list of
 * terms/semesters making up the academic year.
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Section`, `Stack`, `Badge`, `Heading`, `Text`) — no data
 * fetching, no business logic. Reuses the same ordered-list pattern as
 * `@/features/about`'s `AboutTimeline` and `@/features/admissions`'s
 * `AdmissionSteps` (a semantic `<ol>` with a leading border, §26 —
 * screen readers announce term order natively), with each term's
 * `order` rendered as a numbered `Badge`. Terms are grouped into a
 * local array literal (`./data`) rather than interleaved in JSX
 * (Website Frontend Architecture §4, §8), so swapping this for a
 * `useAcademicCalendar()`-style data hook later is a matter of
 * replacing that literal — this component's JSX does not need to
 * change. Real copy is ultimately the backend's Academic Calendar
 * content-module data; this renders frontend-owned Persian
 * placeholder copy in the meantime.
 */
export function Terms() {
  return (
    <Section spacing="lg" aria-labelledby="academic-calendar-terms-heading">
      <Stack gap="md">
        <Heading id="academic-calendar-terms-heading" level={2}>
          نیم‌سال‌ها و ترم‌های تحصیلی
        </Heading>
        <Stack gap="none" as="ol" className="border-s border-border ps-6">
          {terms.map((term, index) => (
            <Stack
              key={term.id}
              as="li"
              direction="row"
              gap="sm"
              className={
                index === terms.length - 1
                  ? "pb-0 pt-6 first:pt-0"
                  : "pb-6 pt-6 first:pt-0"
              }
            >
              <Badge variant="default" className="w-fit shrink-0">
                {term.order}
              </Badge>
              <Stack gap="xs">
                <Text as="span" weight="semibold">
                  {term.title}
                </Text>
                <Text as="span" variant="caption" color="muted">
                  {term.dateRange}
                </Text>
                <Text variant="bodySm" color="muted">
                  {term.description}
                </Text>
              </Stack>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Section>
  );
}

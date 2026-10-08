import { Badge, Heading, Section, Stack, Text } from "@/shared/design-system/components";
import { admissionSteps } from "./data";

/**
 * Admissions page "Steps" section — the ordered admission process,
 * from first consultation through final registration.
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Section`, `Stack`, `Badge`, `Heading`, `Text`) — no data
 * fetching, no business logic. Reuses the same ordered-list pattern as
 * `@/features/about`'s `AboutTimeline` (a semantic `<ol>` with a
 * leading border, §26 — screen readers announce step order natively),
 * with each step's `order` rendered as a numbered `Badge` instead of a
 * year label. Steps are grouped into a local array literal (`./data`)
 * rather than interleaved in JSX (Website Frontend Architecture §4,
 * §8), so swapping this for a `useAdmissions()`-style data hook later
 * is a matter of replacing that literal — this component's JSX does
 * not need to change. Real copy is ultimately the backend's Admissions
 * content-module data; this renders frontend-owned Persian placeholder
 * copy in the meantime.
 */
export function AdmissionSteps() {
  return (
    <Section spacing="lg" aria-labelledby="admissions-steps-heading">
      <Stack gap="md">
        <Heading id="admissions-steps-heading" level={2}>
          مراحل پذیرش
        </Heading>
        <Stack gap="none" as="ol" className="border-s border-border ps-6">
          {admissionSteps.map((step, index) => (
            <Stack
              key={step.id}
              as="li"
              direction="row"
              gap="sm"
              className={
                index === admissionSteps.length - 1
                  ? "pb-0 pt-6 first:pt-0"
                  : "pb-6 pt-6 first:pt-0"
              }
            >
              <Badge variant="default" className="w-fit shrink-0">
                {step.order}
              </Badge>
              <Stack gap="xs">
                <Text as="span" weight="semibold">
                  {step.title}
                </Text>
                <Text variant="bodySm" color="muted">
                  {step.description}
                </Text>
              </Stack>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Section>
  );
}

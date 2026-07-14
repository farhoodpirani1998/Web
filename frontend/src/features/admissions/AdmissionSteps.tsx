import { Heading, Section, Stack, Text } from "@/shared/design-system/components";
import { admissionSteps } from "./data";

/**
 * Admissions page "Steps" section — the ordered admission process,
 * from first consultation through final registration.
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Section`, `Stack`, `Heading`, `Text`) — no data
 * fetching, no business logic. Reuses the same ordered-list pattern as
 * `@/features/about`'s `AboutTimeline` (a semantic `<ol>` with a
 * leading border, §26 — screen readers announce step order natively).
 * Steps are grouped into a local array literal (`./data`) rather than
 * interleaved in JSX (Website Frontend Architecture §4, §8), so
 * swapping this for a `useAdmissions()`-style data hook later is a
 * matter of replacing that literal — this component's JSX does not
 * need to change. Real copy is ultimately the backend's Admissions
 * content-module data; this renders frontend-owned Persian placeholder
 * copy in the meantime.
 *
 * Visual refresh: adopts the exact numbered-marker treatment
 * `AboutTimeline` already established — a gold-tinted connecting rule
 * with a small dot on it, the final step's dot filled solid to read as
 * "complete" — swapping the previous plain `Badge` numbers for a
 * navy/gold circle marker (the same medallion `AboutValues`/
 * `ContactInfo` use) so this reads as part of the same premium
 * navy/gold system, plus the gold underline heading accent used across
 * the redesigned pages. The semantic `<ol>`/`<li>` structure and step
 * order are unchanged.
 */
export function AdmissionSteps() {
  return (
    <Section spacing="lg" aria-labelledby="admissions-steps-heading">
      <Stack gap="md">
        <Stack gap="xs" align="start">
          <Heading id="admissions-steps-heading" level={2}>
            مراحل پذیرش
          </Heading>
          <span aria-hidden="true" className="block h-1 w-16 rounded-full bg-brand-gold" />
        </Stack>

        <Stack gap="none" as="ol" className="border-s-2 border-brand-gold/30 ps-6">
          {admissionSteps.map((step, index) => {
            const isLast = index === admissionSteps.length - 1;
            return (
              <Stack
                key={step.id}
                as="li"
                direction="row"
                gap="sm"
                className={`relative ${isLast ? "pb-0 pt-6 first:pt-0" : "pb-6 pt-6 first:pt-0"}`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute -start-[1.875rem] top-7 h-3 w-3 rounded-full border-2 border-brand-gold ${
                    isLast ? "bg-brand-gold" : "bg-background"
                  }`}
                />
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-navy text-sm font-bold text-brand-gold"
                >
                  {step.order}
                </span>
                <Stack gap="xs">
                  <Text as="span" weight="semibold" className="font-heading">
                    {step.title}
                  </Text>
                  <Text variant="bodySm" color="muted">
                    {step.description}
                  </Text>
                </Stack>
              </Stack>
            );
          })}
        </Stack>
      </Stack>
    </Section>
  );
}

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Grid,
  Heading,
  Section,
  Stack,
  Text,
} from "@/shared/design-system/components";
import { tuitionPlans } from "./data";
import { CheckIcon } from "./icons";

/**
 * Admissions page "Tuition Overview" section — a per-grade summary of
 * tuition, not a full pricing/checkout flow (§35 "does not invent
 * backend functionality" — there is no payment or invoicing module to
 * wire up here, only informational placeholder copy).
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Section`, `Stack`, `Grid`, `Card`, `Heading`, `Text`) —
 * no data fetching, no business logic. Reuses the same card-grid
 * pattern as this feature's own `Requirements`/`RequiredDocuments` and
 * `@/features/about`'s `AboutValues`/`AboutStats`. Plan entries are
 * grouped into a local array literal (`./data`) rather than
 * interleaved in JSX (Website Frontend Architecture §4, §8), so
 * swapping this for a `useAdmissions()`-style data hook later is a
 * matter of replacing that literal — this component's JSX does not
 * need to change. Real prices are ultimately the backend's Admissions
 * content-module data; every value here is frontend-owned Persian
 * placeholder copy, not a real figure.
 *
 * Visual refresh: cards move to `elevated` with a hover lift and a
 * thin gold top accent (the same treatment `AboutStats` uses), the
 * price becomes the card's clear visual anchor (larger, `brand-gold`-
 * toned numeral, matching `AboutStats`' "big number, small label"
 * hierarchy), and the `includes` list swaps its `Badge` pills for a
 * check-icon list — easier to scan at this text length and consistent
 * with the checklist treatment `Information`/`RequiredDocuments` now
 * use — plus the gold underline heading accent used across the
 * redesigned pages. No plan is singled out as "featured": that would
 * be a marketing claim this placeholder data doesn't support.
 */
export function TuitionOverview() {
  return (
    <Section
      spacing="lg"
      tone="muted"
      className="rounded-lg"
      aria-labelledby="admissions-tuition-heading"
    >
      <Stack gap="md">
        <Stack gap="sm">
          <Stack gap="xs" align="start">
            <Heading id="admissions-tuition-heading" level={2}>
              نمای کلی شهریه
            </Heading>
            <span aria-hidden="true" className="block h-1 w-16 rounded-full bg-brand-gold" />
          </Stack>
          <Text variant="lead" className="max-w-2xl">
            متن نمونه برای معرفی کلی شهریه دوره‌های مختلف. مبالغ دقیق و شرایط پرداخت
            نهایی از طریق واحد پذیرش هر پردیس اعلام خواهد شد.
          </Text>
        </Stack>

        <Grid cols="3" gap="md">
          {tuitionPlans.map((plan) => (
            <Card
              key={plan.id}
              variant="elevated"
              padding="md"
              className="group relative overflow-hidden bg-background transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-brand-gold" />
              <CardHeader className="p-0 pt-1.5">
                <CardTitle className="font-heading">{plan.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-0 pt-3">
                <Stack gap="md">
                  <Stack gap="none">
                    <Text
                      as="span"
                      weight="bold"
                      className="font-heading text-2xl text-brand-gold"
                    >
                      {plan.price}
                    </Text>
                    <Text variant="caption" color="muted">
                      {plan.period}
                    </Text>
                  </Stack>

                  <Stack as="ul" gap="xs">
                    {plan.includes.map((item) => (
                      <Stack key={item} as="li" direction="row" gap="xs" align="center">
                        <span aria-hidden="true" className="shrink-0 text-brand-gold">
                          <CheckIcon className="h-4 w-4" />
                        </span>
                        <Text variant="bodySm" color="muted">
                          {item}
                        </Text>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Stack>
    </Section>
  );
}

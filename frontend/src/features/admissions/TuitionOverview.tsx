import {
  Badge,
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

/**
 * Admissions page "Tuition Overview" section — a per-grade summary of
 * tuition, not a full pricing/checkout flow (§35 "does not invent
 * backend functionality" — there is no payment or invoicing module to
 * wire up here, only informational placeholder copy).
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Section`, `Stack`, `Grid`, `Card`, `Badge`, `Heading`,
 * `Text`) — no data fetching, no business logic. Reuses the same
 * card-grid pattern as this feature's own `Requirements`/
 * `RequiredDocuments` and `@/features/about`'s `AboutValues`. Plan
 * entries are grouped into a local array literal (`./data`) rather
 * than interleaved in JSX (Website Frontend Architecture §4, §8), so
 * swapping this for a `useAdmissions()`-style data hook later is a
 * matter of replacing that literal — this component's JSX does not
 * need to change. Real prices are ultimately the backend's Admissions
 * content-module data; every value here is frontend-owned Persian
 * placeholder copy, not a real figure.
 */
export function TuitionOverview() {
  return (
    <Section spacing="lg" tone="muted" className="rounded-lg" aria-labelledby="admissions-tuition-heading">
      <Stack gap="md">
        <Stack gap="sm">
          <Heading id="admissions-tuition-heading" level={2}>
            نمای کلی شهریه
          </Heading>
          <Text variant="lead" className="max-w-2xl">
            متن نمونه برای معرفی کلی شهریه دوره‌های مختلف. مبالغ دقیق و شرایط پرداخت
            نهایی از طریق واحد پذیرش هر پردیس اعلام خواهد شد.
          </Text>
        </Stack>

        <Grid cols="3" gap="md">
          {tuitionPlans.map((plan) => (
            <Card key={plan.id} variant="outline" padding="md">
              <CardHeader className="p-0">
                <CardTitle>{plan.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-0 pt-2">
                <Stack gap="sm">
                  <Stack gap="none">
                    <Text weight="bold" color="primary">
                      {plan.price}
                    </Text>
                    <Text variant="caption" color="muted">
                      {plan.period}
                    </Text>
                  </Stack>

                  <Stack direction="row" gap="xs" wrap>
                    {plan.includes.map((item) => (
                      <Badge key={item} variant="outline">
                        {item}
                      </Badge>
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

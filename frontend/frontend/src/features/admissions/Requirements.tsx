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
import { requirements } from "./data";

/**
 * Admissions page "Requirements" section — eligibility criteria for
 * admission.
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Section`, `Stack`, `Grid`, `Card`, `Heading`, `Text`) —
 * no data fetching, no business logic. Reuses the same two-column
 * card-grid pattern as `@/features/about`'s `AboutValues`. Requirement
 * items are grouped into a local array literal (`./data`) rather than
 * interleaved in JSX (Website Frontend Architecture §4, §8), so
 * swapping this for a `useAdmissions()`-style data hook later is a
 * matter of replacing that literal — this component's JSX does not
 * need to change. Real copy is ultimately the backend's Admissions
 * content-module data; this renders frontend-owned Persian placeholder
 * copy in the meantime.
 */
export function Requirements() {
  return (
    <Section spacing="lg" tone="muted" className="rounded-lg" aria-labelledby="admissions-requirements-heading">
      <Stack gap="md">
        <Heading id="admissions-requirements-heading" level={2}>
          شرایط پذیرش
        </Heading>
        <Grid cols="2" gap="md">
          {requirements.map((requirement) => (
            <Card key={requirement.id} variant="outline" padding="md">
              <CardHeader className="p-0">
                <CardTitle>{requirement.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-0 pt-2">
                <Text variant="bodySm" color="muted">
                  {requirement.description}
                </Text>
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Stack>
    </Section>
  );
}

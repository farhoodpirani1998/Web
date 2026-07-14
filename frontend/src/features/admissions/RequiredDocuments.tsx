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
import { requiredDocuments } from "./data";

/**
 * Admissions page "Required Documents" section — the checklist of
 * documents needed to complete a student's file.
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Section`, `Stack`, `Grid`, `Card`, `Heading`, `Text`) —
 * no data fetching, no business logic. Reuses the same card-grid
 * pattern as this feature's own `Requirements` and
 * `@/features/about`'s `AboutValues`, at a three-column density since
 * each entry is a short document label rather than a longer
 * explanation. Document items are grouped into a local array literal
 * (`./data`) rather than interleaved in JSX (Website Frontend
 * Architecture §4, §8), so swapping this for a `useAdmissions()`-style
 * data hook later is a matter of replacing that literal — this
 * component's JSX does not need to change. Real copy is ultimately the
 * backend's Admissions content-module data; this renders
 * frontend-owned Persian placeholder copy in the meantime.
 */
export function RequiredDocuments() {
  return (
    <Section spacing="lg" aria-labelledby="admissions-documents-heading">
      <Stack gap="md">
        <Heading id="admissions-documents-heading" level={2}>
          مدارک مورد نیاز
        </Heading>
        <Grid cols="3" gap="md">
          {requiredDocuments.map((document) => (
            <Card key={document.id} variant="outline" padding="md">
              <CardHeader className="p-0">
                <CardTitle>{document.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-0 pt-2">
                <Text variant="bodySm" color="muted">
                  {document.description}
                </Text>
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Stack>
    </Section>
  );
}

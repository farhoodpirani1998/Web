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
import { examPeriods } from "./data";

/**
 * Academic Calendar page "Exams" section — the scheduled midterm and
 * final examination periods for the academic year.
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Section`, `Stack`, `Grid`, `Card`, `Heading`, `Text`) —
 * no data fetching, no business logic. Reuses the same card-grid
 * pattern as `@/features/admissions`'s `Requirements`/
 * `RequiredDocuments` and `@/features/about`'s `AboutValues`. Exam
 * periods are grouped into a local array literal (`./data`) rather
 * than interleaved in JSX (Website Frontend Architecture §4, §8), so
 * swapping this for a `useAcademicCalendar()`-style data hook later is
 * a matter of replacing that literal — this component's JSX does not
 * need to change. Real dates are ultimately the backend's Academic
 * Calendar content-module data; this renders frontend-owned Persian
 * placeholder copy in the meantime.
 */
export function Exams() {
  return (
    <Section spacing="lg" aria-labelledby="academic-calendar-exams-heading">
      <Stack gap="md">
        <Heading id="academic-calendar-exams-heading" level={2}>
          بازه‌های امتحانی
        </Heading>
        <Grid cols="2" gap="md">
          {examPeriods.map((exam) => (
            <Card key={exam.id} variant="outline" padding="md">
              <CardHeader className="p-0">
                <CardTitle>{exam.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-0 pt-2">
                <Stack gap="xs">
                  <Text variant="bodySm" weight="medium" color="primary">
                    {exam.dateRange}
                  </Text>
                  <Text variant="bodySm" color="muted">
                    {exam.description}
                  </Text>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Stack>
    </Section>
  );
}

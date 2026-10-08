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
import { cn } from "@/shared/utils/cn";
import { examPeriods } from "./data";

/**
 * Academic Calendar page "Exams" section — the scheduled midterm and
 * final examination periods for the academic year.
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Section`, `Stack`, `Grid`, `Card`, `Heading`, `Text`) —
 * no data fetching, no business logic. Exam periods are grouped into a
 * local array literal (`./data`) rather than interleaved in JSX
 * (Website Frontend Architecture §4, §8), so swapping this for a
 * `useAcademicCalendar()`-style data hook later is a matter of
 * replacing that literal — this component's JSX does not need to
 * change. Real dates are ultimately the backend's Academic Calendar
 * content-module data; this renders frontend-owned Persian
 * placeholder copy in the meantime.
 *
 * Visual refresh: cards move from the plain `outline` variant to
 * `elevated` with a hover lift and a thin gold top accent bar (the
 * same "premium stat/value card" treatment `YearOverview` and
 * `@/features/about`'s `AboutStats` already use), each carries a
 * navy/gold exam-glyph marker (the same "numbered/iconed circle"
 * language `@/features/about`'s `AboutValues` established), and the
 * date range is promoted from plain colored text into a `Badge` for
 * stronger scannability. A short lead paragraph is added under the
 * heading, matching the heading+lead pairing used across this page's
 * other sections.
 */
export function Exams() {
  return (
    <Section spacing="lg" aria-labelledby="academic-calendar-exams-heading">
      <Stack gap="md">
        <Stack gap="sm">
          <Heading id="academic-calendar-exams-heading" level={2}>
            بازه‌های امتحانی
          </Heading>
          <Text variant="lead" className="max-w-2xl">
            متن نمونه برای معرفی بازه‌های میان‌ترم و پایان‌ترم سال تحصیلی جاری.
          </Text>
        </Stack>
        <Grid cols="2" gap="lg">
          {examPeriods.map((exam) => (
            <Card
              key={exam.id}
              variant="elevated"
              padding="lg"
              className="group relative overflow-hidden bg-background transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-brand-gold" />
              <CardHeader className="gap-3 p-0">
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-navy text-brand-gold"
                >
                  <ExamGlyph className="h-5 w-5" />
                </span>
                <CardTitle className="font-heading">{exam.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-0 pt-3">
                <Stack gap="sm">
                  <Badge variant="secondary" className="w-fit">
                    {exam.dateRange}
                  </Badge>
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

/** Small decorative "exam sheet" glyph for the card marker. Purely presentational. */
function ExamGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn(className)} aria-hidden="true" focusable="false">
      <path
        d="M6.5 3.5h8l3 3v14a1 1 0 0 1-1 1h-10a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M14.5 3.5v3h3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path
        d="M8.5 12.5 10 14l3.5-3.5M8.5 17h7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

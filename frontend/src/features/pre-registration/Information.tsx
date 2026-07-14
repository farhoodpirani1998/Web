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
  Typography,
} from "@/shared/design-system/components";

/**
 * Pre-registration page "Information" section — eligibility, required
 * documents, and the registration timeline, following the same card-
 * grid pattern as the homepage's `Features` section and `AboutValues`.
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Section`, `Stack`, `Grid`, `Card`, `Heading`, `Text`) —
 * no new components, no data fetching, no business logic. Items are
 * grouped into local array literals rather than interleaved in JSX, so
 * swapping this for a `usePreRegistration()`-style data hook later is
 * a matter of replacing the literals — the layout and design-system
 * wiring below do not need to change. Real copy is ultimately
 * Pre-registration content-module data (§4, §8); this renders
 * frontend-owned Persian placeholder copy in the meantime.
 */

const eligibilityItems = [
  {
    id: "age",
    title: "شرایط سنی",
    description: "متن نمونه برای توضیح محدوده سنی پذیرش دانش‌آموزان.",
  },
  {
    id: "grade",
    title: "پایه تحصیلی",
    description: "متن نمونه برای توضیح پایه‌های تحصیلی قابل ثبت‌نام.",
  },
  {
    id: "capacity",
    title: "ظرفیت پذیرش",
    description: "متن نمونه برای توضیح ظرفیت باقی‌مانده هر پایه.",
  },
] as const;

const requiredDocuments = [
  "کپی شناسنامه و کارت ملی دانش‌آموز",
  "کارنامه تحصیلی سال گذشته",
  "دو قطعه عکس پرسنلی",
  "مدارک هویتی والدین",
] as const;

const timelineSteps = [
  { id: "step-1", title: "تکمیل فرم", description: "تکمیل فرم پیش‌ثبت‌نام آنلاین." },
  {
    id: "step-2",
    title: "بررسی مدارک",
    description: "بررسی اطلاعات توسط کارشناسان مجموعه.",
  },
  { id: "step-3", title: "مصاحبه", description: "هماهنگی جلسه آشنایی و مصاحبه." },
  {
    id: "step-4",
    title: "تأیید نهایی",
    description: "اعلام نتیجه و تکمیل ثبت‌نام قطعی.",
  },
] as const;

export function Information() {
  return (
    <Section spacing="lg" tone="muted" aria-labelledby="pre-registration-info-heading">
      <Stack gap="xl">
        <Stack gap="sm" align="center" className="text-center">
          <Heading id="pre-registration-info-heading" level={2}>
            اطلاعات پیش‌ثبت‌نام
          </Heading>
          <Text variant="lead" className="max-w-2xl">
            متن معرفی نمونه برای شرایط، مدارک لازم و مراحل پیش‌ثبت‌نام.
          </Text>
        </Stack>

        <Stack gap="sm">
          <Heading level={3} as="h3">
            شرایط پذیرش
          </Heading>
          <Grid cols="3" gap="md">
            {eligibilityItems.map((item) => (
              <Card key={item.id} variant="outline" padding="md">
                <CardHeader className="p-0">
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-0 pt-2">
                  <Text variant="bodySm" color="muted">
                    {item.description}
                  </Text>
                </CardContent>
              </Card>
            ))}
          </Grid>
        </Stack>

        <Stack gap="sm">
          <Heading level={3} as="h3">
            مدارک مورد نیاز
          </Heading>
          <Card variant="outline" padding="md">
            <Stack as="ul" gap="xs" className="list-disc ps-5">
              {requiredDocuments.map((doc) => (
                <Typography as="li" variant="bodySm" key={doc}>
                  {doc}
                </Typography>
              ))}
            </Stack>
          </Card>
        </Stack>

        <Stack gap="sm">
          <Heading level={3} as="h3">
            مراحل پیش‌ثبت‌نام
          </Heading>
          <Grid cols="4" gap="md">
            {timelineSteps.map((step, index) => (
              <Card key={step.id} variant="outline" padding="md">
                <Stack gap="xs">
                  <Text as="span" variant="bodySm" weight="bold" color="primary">
                    {`${index + 1}. `}
                    {step.title}
                  </Text>
                  <Text variant="bodySm" color="muted">
                    {step.description}
                  </Text>
                </Stack>
              </Card>
            ))}
          </Grid>
        </Stack>
      </Stack>
    </Section>
  );
}

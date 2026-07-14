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
import { BookIcon, CalendarIcon, CheckIcon, UsersIcon } from "./icons";

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
 *
 * Visual refresh: eligibility/timeline cards move from the plain
 * `outline` variant to the `elevated` + hover-lift + navy/gold icon
 * medallion treatment already established by `AboutValues`/
 * `ContactInfo`/`AboutStats` (icons chosen per `item.id`, purely
 * presentational — no new data field), each section heading gets the
 * same gold underline accent used across the redesigned pages, and the
 * document checklist swaps its plain bullets for a check-icon list so
 * this reads as part of the same premium navy/gold system instead of
 * a plain bordered list.
 */

const eligibilityItems = [
  {
    id: "age",
    icon: CalendarIcon,
    title: "شرایط سنی",
    description: "متن نمونه برای توضیح محدوده سنی پذیرش دانش‌آموزان.",
  },
  {
    id: "grade",
    icon: BookIcon,
    title: "پایه تحصیلی",
    description: "متن نمونه برای توضیح پایه‌های تحصیلی قابل ثبت‌نام.",
  },
  {
    id: "capacity",
    icon: UsersIcon,
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
          <span aria-hidden="true" className="block h-1 w-16 rounded-full bg-brand-gold" />
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
              <Card
                key={item.id}
                variant="elevated"
                padding="md"
                className="group bg-background transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <CardHeader className="flex-row items-center gap-3 p-0">
                  <span
                    aria-hidden="true"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-navy text-brand-gold"
                  >
                    <item.icon className="h-5 w-5" />
                  </span>
                  <CardTitle className="font-heading">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-0 pt-3">
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
          <Card variant="elevated" padding="lg" className="bg-background">
            <Stack as="ul" gap="sm">
              {requiredDocuments.map((doc) => (
                <Stack key={doc} as="li" direction="row" gap="sm" align="center">
                  <span aria-hidden="true" className="shrink-0 text-brand-gold">
                    <CheckIcon className="h-5 w-5" />
                  </span>
                  <Text variant="bodySm">{doc}</Text>
                </Stack>
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
              <Card
                key={step.id}
                variant="elevated"
                padding="md"
                className="group relative overflow-hidden bg-background transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-brand-gold" />
                <Stack gap="xs">
                  <span
                    aria-hidden="true"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-navy text-sm font-bold text-brand-gold"
                  >
                    {index + 1}
                  </span>
                  <Text as="span" variant="bodySm" weight="semibold">
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

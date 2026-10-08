import { useFaq } from "@/features/faq/useFaq";
import { Card, Heading, Section, Stack, Text } from "@/shared/design-system/components";
import { cn } from "@/shared/utils/cn";

/**
 * Academic Calendar page "FAQ" section.
 *
 * Presentation only, no business logic. Matches the pattern already
 * established by `@/features/admissions`'s, `@/features/campuses`'s,
 * `@/features/teachers`'s, `@/features/events`'s, and
 * `@/features/about`'s `FAQ`: native `<details>`/`<summary>`
 * disclosure widgets (keyboard + screen-reader accessible, §26)
 * instead of a controlled `open`/`onToggle` state, so this section is
 * fully interactive with zero React/component state. No accordion
 * primitive exists yet in the design system; promoting this (now a
 * further identical instance of the pattern) to a shared `Accordion`
 * primitive is a natural follow-up.
 *
 * Items are grouped into a local array literal rather than
 * interleaved in JSX, so swapping this for a
 * `useAcademicCalendar()`-style data hook later is a matter of
 * replacing the literal. Real questions/answers are ultimately
 * Academic Calendar content-module data (§4, §8); this renders
 * frontend-owned Persian placeholder copy in the meantime.
 *
 * Now backed by the shared `useFaq()` hook (`@/features/faq`, `GET
 * /faq`). The local `faqItems` literal above is kept as-is and used
 * as the fallback: while the request is loading, if it errors, or if
 * the API returns an empty list, this still renders the local
 * placeholder copy, so the section is never empty. No other
 * design/markup changes.
 */

const faqItems = [
  {
    id: "calendar-changes",
    question: "آیا تاریخ‌های تقویم آموزشی ممکن است تغییر کند؟",
    answer: "متن نمونه پاسخ درباره احتمال تغییر تاریخ‌ها و نحوه اطلاع‌رسانی آن.",
  },
  {
    id: "campus-differences",
    question: "آیا تقویم آموزشی در همه پردیس‌ها یکسان است؟",
    answer: "متن نمونه پاسخ درباره تفاوت‌های احتمالی تقویم آموزشی بین پردیس‌ها.",
  },
  {
    id: "makeup-classes",
    question: "کلاس‌های افتاده به دلیل تعطیلی چگونه جبران می‌شوند؟",
    answer: "متن نمونه پاسخ درباره برنامه جبرانی کلاس‌های افتاده در تعطیلات.",
  },
  {
    id: "exam-schedule",
    question: "برنامه دقیق زمان‌بندی امتحانات از کجا اعلام می‌شود؟",
    answer: "متن نمونه پاسخ درباره نحوه اطلاع‌رسانی برنامه دقیق امتحانات به دانش‌آموزان.",
  },
] as const;

export function FAQ() {
  const { data } = useFaq();
  const items = data && data.length > 0 ? data : faqItems;

  return (
    <Section spacing="lg" aria-labelledby="academic-calendar-faq-heading">
      <Stack gap="lg">
        <Stack gap="sm" align="center" className="text-center">
          <Heading id="academic-calendar-faq-heading" level={2}>
            سوالات متداول
          </Heading>
          <Text variant="lead" className="max-w-2xl">
            متن معرفی نمونه برای بخش سوالات متداول تقویم آموزشی.
          </Text>
        </Stack>

        <Stack gap="sm" className="mx-auto w-full max-w-3xl">
          {items.map((item) => (
            <Card key={item.id} variant="outline" padding="none">
              <details className="group px-6 py-4">
                <summary
                  className={cn(
                    "cursor-pointer list-none font-medium text-foreground",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    "flex items-center justify-between gap-4",
                  )}
                >
                  <Text as="span" variant="body" weight="medium">
                    {item.question}
                  </Text>
                  <Text
                    as="span"
                    aria-hidden="true"
                    className="shrink-0 transition-transform group-open:rotate-180"
                  >
                    ⌄
                  </Text>
                </summary>
                <Text variant="bodySm" color="muted" className="pt-3">
                  {item.answer}
                </Text>
              </details>
            </Card>
          ))}
        </Stack>
      </Stack>
    </Section>
  );
}

import { useFaq } from "@/features/faq/useFaq";
import { Card, Heading, Section, Stack, Text } from "@/shared/design-system/components";
import { cn } from "@/shared/utils/cn";

/**
 * Events page "FAQ" section.
 *
 * Presentation only, no business logic. Matches the pattern already
 * established by `@/features/campuses`'s `FAQ` and
 * `@/features/teachers`'s `FAQ`: native `<details>`/`<summary>`
 * disclosure widgets (keyboard + screen-reader accessible, §26)
 * instead of a controlled `open`/`onToggle` state, so this section is
 * fully interactive with zero React/component state. No accordion
 * primitive exists yet in the design system; promoting this (now a
 * fourth identical instance of the pattern) to a shared `Accordion`
 * primitive is a natural follow-up.
 *
 * Items are grouped into a local array literal rather than
 * interleaved in JSX, so swapping this for a `useEvents()`-style data
 * hook later is a matter of replacing the literal. Real
 * questions/answers are ultimately Events content-module data
 * (§4, §8); this renders frontend-owned Persian placeholder copy in
 * the meantime.
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
    id: "registration",
    question: "چگونه می‌توان برای شرکت در یک رویداد ثبت‌نام کرد؟",
    answer: "متن نمونه پاسخ درباره فرآیند ثبت‌نام برای رویدادهای مجموعه.",
  },
  {
    id: "eligibility",
    question: "چه کسانی می‌توانند در رویدادها شرکت کنند؟",
    answer: "متن نمونه پاسخ درباره افراد واجد شرایط برای هر دسته از رویدادها.",
  },
  {
    id: "cancellation",
    question: "در صورت لغو یا تغییر زمان رویداد چه اتفاقی می‌افتد؟",
    answer: "متن نمونه پاسخ درباره اطلاع‌رسانی تغییرات و لغو رویدادها.",
  },
  {
    id: "location",
    question: "رویدادها در کدام پردیس‌ها برگزار می‌شوند؟",
    answer: "متن نمونه پاسخ درباره پردیس‌های میزبان رویدادهای مختلف.",
  },
] as const;

export function FAQ() {
  const { data } = useFaq();
  const items = data && data.length > 0 ? data : faqItems;

  return (
    <Section spacing="lg" aria-labelledby="events-faq-heading">
      <Stack gap="lg">
        <Stack gap="sm" align="center" className="text-center">
          <Heading id="events-faq-heading" level={2}>
            سوالات متداول
          </Heading>
          <Text variant="lead" className="max-w-2xl">
            متن معرفی نمونه برای بخش سوالات متداول رویدادها.
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

import { Card, Heading, Section, Stack, Text } from "@/shared/design-system/components";
import { cn } from "@/shared/utils/cn";

/**
 * Admissions page "FAQ" section.
 *
 * Presentation only, no business logic. Matches the pattern already
 * established by `@/features/campuses`'s, `@/features/teachers`'s,
 * `@/features/events`'s, and `@/features/about`'s `FAQ`: native
 * `<details>`/`<summary>` disclosure widgets (keyboard + screen-reader
 * accessible, §26) instead of a controlled `open`/`onToggle` state, so
 * this section is fully interactive with zero React/component state.
 * No accordion primitive exists yet in the design system; promoting
 * this (now a sixth identical instance of the pattern) to a shared
 * `Accordion` primitive is a natural follow-up.
 *
 * Items are grouped into a local array literal rather than
 * interleaved in JSX, so swapping this for a `useAdmissions()`-style
 * data hook later is a matter of replacing the literal. Real
 * questions/answers are ultimately Admissions content-module data
 * (§4, §8); this renders frontend-owned Persian placeholder copy in
 * the meantime.
 *
 * Visual refresh: adopts the same gold underline heading accent and
 * gold-hover/gold-chevron card treatment already established by
 * `AboutFAQ`/`PreRegistrationFAQ` so this section reads as part of the
 * same premium card language instead of a plain bordered list — no
 * change to the disclosure behavior itself.
 */

const faqItems = [
  {
    id: "timeline",
    question: "فرآیند پذیرش معمولاً چقدر زمان می‌برد؟",
    answer: "متن نمونه پاسخ درباره بازه زمانی معمول فرآیند پذیرش تا ثبت‌نام قطعی.",
  },
  {
    id: "mid-year",
    question: "آیا امکان ثبت‌نام در میانه سال تحصیلی وجود دارد؟",
    answer: "متن نمونه پاسخ درباره شرایط پذیرش دانش‌آموز در میانه سال تحصیلی.",
  },
  {
    id: "scholarship",
    question: "آیا مجموعه بورسیه یا تخفیف شهریه ارائه می‌دهد؟",
    answer: "متن نمونه پاسخ درباره شرایط و نحوه درخواست بورسیه یا تخفیف شهریه.",
  },
  {
    id: "sibling",
    question: "برای ثبت‌نام چند فرزند از یک خانواده چه شرایطی وجود دارد؟",
    answer: "متن نمونه پاسخ درباره فرآیند و مزایای ثبت‌نام چند فرزند از یک خانواده.",
  },
] as const;

export function FAQ() {
  return (
    <Section spacing="lg" aria-labelledby="admissions-faq-heading">
      <Stack gap="lg">
        <Stack gap="sm" align="center" className="text-center">
          <Heading id="admissions-faq-heading" level={2}>
            سوالات متداول
          </Heading>
          <span aria-hidden="true" className="block h-1 w-16 rounded-full bg-brand-gold" />
          <Text variant="lead" className="max-w-2xl">
            متن معرفی نمونه برای بخش سوالات متداول پذیرش و ثبت‌نام.
          </Text>
        </Stack>

        <Stack gap="sm" className="mx-auto w-full max-w-3xl">
          {faqItems.map((item) => (
            <Card
              key={item.id}
              variant="outline"
              padding="none"
              className="bg-background transition-colors hover:border-brand-gold/40"
            >
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
                    className="shrink-0 text-brand-gold transition-transform group-open:rotate-180"
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

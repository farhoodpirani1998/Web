import { useFaq } from "@/features/faq/useFaq";
import { Card, Heading, Section, Stack, Text } from "@/shared/design-system/components";
import { cn } from "@/shared/utils/cn";

/**
 * Pre-registration page "FAQ" section.
 *
 * Presentation only, no business logic. Each item's expand/collapse
 * behavior uses the native `<details>`/`<summary>` elements rather
 * than a controlled `open`/`onToggle` state — this keeps the section
 * fully interactive (keyboard + screen-reader accessible disclosure
 * widgets, §26) while introducing zero React/component state, in
 * keeping with this Sprint's "no form state management" scope. No
 * accordion primitive exists yet in the design system; promoting this
 * to a shared `Accordion` primitive is a natural follow-up once a
 * second accordion exists in the app.
 *
 * Items are grouped into a local array literal rather than
 * interleaved in JSX, so swapping this for a `usePreRegistration()`-
 * style data hook later is a matter of replacing the literal — the
 * layout and design-system wiring below do not need to change. Real
 * questions/answers are ultimately Pre-registration content-module
 * data (§4, §8); this renders frontend-owned Persian placeholder copy
 * in the meantime.
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
    id: "deadline",
    question: "مهلت پیش‌ثبت‌نام تا چه زمانی است؟",
    answer: "متن نمونه پاسخ درباره مهلت زمانی پیش‌ثبت‌نام.",
  },
  {
    id: "fee",
    question: "آیا پیش‌ثبت‌نام هزینه دارد؟",
    answer: "متن نمونه پاسخ درباره هزینه‌های احتمالی پیش‌ثبت‌نام.",
  },
  {
    id: "confirmation",
    question: "نتیجه پیش‌ثبت‌نام چگونه اعلام می‌شود؟",
    answer: "متن نمونه پاسخ درباره روش اطلاع‌رسانی نتیجه.",
  },
  {
    id: "edit-info",
    question: "آیا امکان ویرایش اطلاعات ثبت‌شده وجود دارد؟",
    answer: "متن نمونه پاسخ درباره ویرایش اطلاعات پس از ارسال فرم.",
  },
] as const;

export function FAQ() {
  const { data } = useFaq();
  const items = data && data.length > 0 ? data : faqItems;

  return (
    <Section spacing="lg" tone="muted" aria-labelledby="pre-registration-faq-heading">
      <Stack gap="lg">
        <Stack gap="sm" align="center" className="text-center">
          <Heading id="pre-registration-faq-heading" level={2}>
            سوالات متداول
          </Heading>
          <Text variant="lead" className="max-w-2xl">
            متن معرفی نمونه برای بخش سوالات متداول پیش‌ثبت‌نام.
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

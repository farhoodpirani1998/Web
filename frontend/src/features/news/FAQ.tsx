import { useFaq } from "@/features/faq/useFaq";
import { Card, Heading, Section, Stack, Text } from "@/shared/design-system/components";
import { cn } from "@/shared/utils/cn";

/**
 * News page "FAQ" section.
 *
 * Presentation only, no business logic. Matches the pattern already
 * established by `@/features/campuses`'s `FAQ`,
 * `@/features/pre-registration`'s `FAQ`, and
 * `@/features/gallery`'s `FAQ`: native `<details>`/`<summary>`
 * disclosure widgets (keyboard + screen-reader accessible, §26)
 * instead of a controlled `open`/`onToggle` state, so this section is
 * fully interactive with zero React/component state. No accordion
 * primitive exists yet in the design system; promoting this pattern
 * to a shared `Accordion` primitive is a natural follow-up now that
 * it appears in five features.
 *
 * Items are grouped into a local array literal rather than
 * interleaved in JSX, so swapping this for a `useNews()`-style data
 * hook later is a matter of replacing the literal. Real
 * questions/answers are ultimately News/Announcements content-module
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
    id: "update-frequency",
    question: "اخبار و اطلاعیه‌ها چند وقت یک‌بار به‌روزرسانی می‌شوند؟",
    answer: "متن نمونه پاسخ درباره دوره‌های انتشار اخبار و اطلاعیه‌های جدید.",
  },
  {
    id: "notifications",
    question: "آیا امکان دریافت اطلاع‌رسانی خبرها وجود دارد؟",
    answer: "متن نمونه پاسخ درباره روش‌های اطلاع‌رسانی اخبار به اولیا و دانش‌آموزان.",
  },
  {
    id: "archive",
    question: "آیا امکان مشاهده اخبار قدیمی‌تر وجود دارد؟",
    answer: "متن نمونه پاسخ درباره دسترسی به آرشیو اخبار و اطلاعیه‌های پیشین.",
  },
  {
    id: "submit-news",
    question: "چگونه می‌توان خبری را برای انتشار پیشنهاد داد؟",
    answer: "متن نمونه پاسخ درباره روش هماهنگی برای پیشنهاد و ارسال خبر جهت انتشار.",
  },
] as const;

export function FAQ() {
  const { data } = useFaq();
  const items = data && data.length > 0 ? data : faqItems;

  return (
    <Section spacing="lg" aria-labelledby="news-faq-heading">
      <Stack gap="lg">
        <Stack gap="sm" align="center" className="text-center">
          <Heading id="news-faq-heading" level={2}>
            سوالات متداول
          </Heading>
          <span aria-hidden="true" className="block h-1 w-16 rounded-full bg-brand-gold" />
          <Text variant="lead" className="max-w-2xl">
            متن معرفی نمونه برای بخش سوالات متداول اخبار و اطلاعیه‌ها.
          </Text>
        </Stack>

        <Stack gap="sm" className="mx-auto w-full max-w-3xl">
          {items.map((item) => (
            <Card
              key={item.id}
              variant="outline"
              padding="none"
              className="transition-colors hover:border-brand-gold/40"
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

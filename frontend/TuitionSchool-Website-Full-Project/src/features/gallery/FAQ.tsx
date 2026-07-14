import { Card, Heading, Section, Stack, Text } from "@/shared/design-system/components";
import { cn } from "@/shared/utils/cn";

/**
 * Gallery page "FAQ" section.
 *
 * Presentation only, no business logic. Matches the pattern already
 * established by `@/features/campuses`'s `FAQ` and
 * `@/features/pre-registration`'s `FAQ`: native `<details>`/
 * `<summary>` disclosure widgets (keyboard + screen-reader accessible,
 * §26) instead of a controlled `open`/`onToggle` state, so this
 * section is fully interactive with zero React/component state. No
 * accordion primitive exists yet in the design system; promoting this
 * pattern to a shared `Accordion` primitive is a natural follow-up
 * now that it appears in four features.
 *
 * Items are grouped into a local array literal rather than
 * interleaved in JSX, so swapping this for a `useGallery()`-style
 * data hook later is a matter of replacing the literal. Real
 * questions/answers are ultimately Gallery/Media content-module data
 * (§4, §8); this renders frontend-owned Persian placeholder copy in
 * the meantime.
 */

const faqItems = [
  {
    id: "update-frequency",
    question: "گالری تصاویر چند وقت یک‌بار به‌روزرسانی می‌شود؟",
    answer: "متن نمونه پاسخ درباره دوره‌های به‌روزرسانی تصاویر گالری.",
  },
  {
    id: "submit-photo",
    question: "آیا امکان ارسال عکس توسط اولیا یا دانش‌آموزان وجود دارد؟",
    answer: "متن نمونه پاسخ درباره فرآیند ارسال و تأیید تصاویر پیشنهادی.",
  },
  {
    id: "usage-rights",
    question: "آیا استفاده از تصاویر گالری برای اهداف دیگر مجاز است؟",
    answer: "متن نمونه پاسخ درباره شرایط استفاده از تصاویر منتشرشده در گالری.",
  },
  {
    id: "full-resolution",
    question: "آیا نسخه با کیفیت بالاتر تصاویر در دسترس است؟",
    answer: "متن نمونه پاسخ درباره دسترسی به نسخه اصلی و باکیفیت تصاویر.",
  },
] as const;

export function FAQ() {
  return (
    <Section spacing="lg" aria-labelledby="gallery-faq-heading">
      <Stack gap="lg">
        <Stack gap="sm" align="center" className="text-center">
          <Heading id="gallery-faq-heading" level={2}>
            سوالات متداول
          </Heading>
          <Text variant="lead" className="max-w-2xl">
            متن معرفی نمونه برای بخش سوالات متداول گالری تصاویر.
          </Text>
        </Stack>

        <Stack gap="sm" className="mx-auto w-full max-w-3xl">
          {faqItems.map((item) => (
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

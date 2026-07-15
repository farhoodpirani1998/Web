import { Card, Heading, Section, Stack, Text } from "@/shared/design-system/components";
import { cn } from "@/shared/utils/cn";

/**
 * About page "FAQ" section.
 *
 * Presentation only, no business logic. Matches the pattern already
 * established by `@/features/campuses`'s, `@/features/teachers`'s,
 * and `@/features/events`'s `FAQ`: native `<details>`/`<summary>`
 * disclosure widgets (keyboard + screen-reader accessible, §26)
 * instead of a controlled `open`/`onToggle` state, so this section is
 * fully interactive with zero React/component state. No accordion
 * primitive exists yet in the design system; promoting this (now a
 * fifth identical instance of the pattern) to a shared `Accordion`
 * primitive is a natural follow-up.
 *
 * Items are grouped into a local array literal rather than
 * interleaved in JSX, matching this feature's other sections
 * (`AboutStats`/`AboutTeam`/`AboutTimeline`/`AboutValues`) and so
 * swapping this for a `useAboutPage()`-style data hook later is a
 * matter of replacing the literal. Real questions/answers are
 * ultimately Static Pages/About content-module data (§4, §8); this
 * renders frontend-owned Persian placeholder copy in the meantime.
 */

const faqItems = [
  {
    id: "history",
    question: "مجموعه از چه سالی فعالیت خود را آغاز کرده است؟",
    answer: "متن نمونه پاسخ درباره سال تأسیس و روند شکل‌گیری مجموعه.",
  },
  {
    id: "branches",
    question: "مجموعه در چند شهر و شعبه فعالیت می‌کند؟",
    answer: "متن نمونه پاسخ درباره شعب فعال و مناطق تحت پوشش مجموعه.",
  },
  {
    id: "values",
    question: "اصول و ارزش‌های اصلی مجموعه چیست؟",
    answer: "متن نمونه پاسخ درباره ارزش‌هایی که مبنای فعالیت روزانه مجموعه هستند.",
  },
  {
    id: "contact-team",
    question: "چگونه می‌توان با اعضای تیم مجموعه در تماس بود؟",
    answer: "متن نمونه پاسخ درباره روش هماهنگی و تماس با تیم مجموعه.",
  },
] as const;

export function AboutFAQ() {
  return (
    <Section spacing="lg" aria-labelledby="about-faq-heading">
      <Stack gap="lg">
        <Stack gap="sm" align="center" className="text-center">
          <Heading id="about-faq-heading" level={2}>
            سوالات متداول
          </Heading>
          <span aria-hidden="true" className="block h-1 w-16 rounded-full bg-brand-gold" />
          <Text variant="lead" className="max-w-2xl">
            متن معرفی نمونه برای بخش سوالات متداول درباره ما.
          </Text>
        </Stack>

        <Stack gap="sm" className="mx-auto w-full max-w-3xl">
          {faqItems.map((item) => (
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

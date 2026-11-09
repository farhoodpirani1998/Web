import { ChevronDown } from "lucide-react";

import { useFaq } from "@/features/faq/useFaq";
import { Card, Heading, Section, Stack, Text } from "@/shared/design-system/components";
import { cn } from "@/shared/utils/cn";
import { useAboutPage } from "./useAboutPage";

/**
 * About page "FAQ" section.
 *
 * Matches the pattern already established by `@/features/campuses`'s,
 * `@/features/teachers`'s, and `@/features/events`'s `FAQ`: native
 * `<details>`/`<summary>` disclosure widgets (keyboard + screen-reader
 * accessible, §26) instead of a controlled `open`/`onToggle` state, so
 * this section is fully interactive with zero React/component state.
 * No accordion primitive exists yet in the design system; promoting
 * this (now a fifth identical instance of the pattern) to a shared
 * `Accordion` primitive is a natural follow-up.
 *
 * Questions and answers come from the FAQ CMS module. The section is
 * omitted when there are no published entries rather than showing
 * sample copy.
 */

export function AboutFAQ() {
  const { data: faqItems, error, isLoading } = useFaq();
  const { data: about } = useAboutPage();
  if (error) {
    return (
      <Section spacing="lg">
        <p role="alert" className="text-sm text-destructive">
          بارگذاری پرسش‌های متداول ناموفق بود: {error.message}
        </p>
      </Section>
    );
  }
  if (isLoading || !faqItems?.length) return null;

  return (
    <Section spacing="lg" aria-labelledby="about-faq-heading">
      <Stack gap="lg">
        <Stack gap="sm" align="center" className="text-center">
          <Heading id="about-faq-heading" level={2}>
            {about?.faqSection.title ?? "سوالات متداول"}
          </Heading>
          <span
            aria-hidden="true"
            className="block h-1 w-16 rounded-full bg-brand-gold"
          />
          {about?.faqSection.description ? (
            <Text variant="lead" className="max-w-2xl">
              {about.faqSection.description}
            </Text>
          ) : null}
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
                  <ChevronDown
                    aria-hidden="true"
                    className="h-5 w-5 shrink-0 text-brand-gold transition-transform group-open:rotate-180"
                  />
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

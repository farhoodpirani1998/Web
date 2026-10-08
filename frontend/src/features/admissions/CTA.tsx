import { buttonVariants, Heading, Link, Section, Stack, Text } from "@/shared/design-system/components";
import { cn } from "@/shared/utils/cn";

/**
 * Admissions page "CTA" section — closes the page by directing
 * visitors to the actual submission flow.
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Section`, `Stack`, `Heading`, `Text`, `Link`/
 * `buttonVariants`) — no new components, no data fetching, no business
 * logic. Reuses the exact same `tone="primary"` rounded banner pattern
 * as the homepage's `@/features/cta`'s `CTA`, just pointed at
 * `/pre-registration` instead of `/contact`. Real headline/supporting
 * copy are ultimately Admissions content-module data (§4, §8); this
 * renders frontend-owned Persian placeholder copy in the meantime.
 *
 * Deliberately does not duplicate `@/features/pre-registration` (route
 * `/pre-registration`) — that feature owns the actual registration
 * form; this component only links to it, the same way `AboutPage`
 * links out to `/contact` rather than re-implementing a contact form.
 */
export function CTA() {
  return (
    <Section spacing="lg" tone="primary" className="rounded-lg" aria-labelledby="admissions-cta-heading">
      <Stack gap="md" align="center" className="text-center px-6">
        <Heading id="admissions-cta-heading" level={2} color="inherit">
          آماده شروع فرآیند ثبت‌نام هستید؟
        </Heading>
        <Text variant="lead" color="inherit" className="max-w-2xl">
          متن جمع‌بندی نمونه برای دعوت خانواده‌ها به تکمیل فرم پیش‌ثبت‌نام و آغاز فرآیند
          پذیرش.
        </Text>
        <Link
          href="/pre-registration"
          className={cn(buttonVariants({ variant: "secondary", size: "lg" }))}
        >
          شروع پیش‌ثبت‌نام
        </Link>
      </Stack>
    </Section>
  );
}

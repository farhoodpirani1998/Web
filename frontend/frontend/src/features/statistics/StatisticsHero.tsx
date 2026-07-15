import { Badge, Heading, Section, Stack, Text } from "@/shared/design-system/components";

/**
 * Statistics page "Hero" section — first section of the `statistics`
 * feature (Website Frontend Architecture §4, §10 "Section
 * Architecture"), following the same pattern as `hero`/`features`/
 * `cta`/`about`/`contact`/`schools`/`news`/`gallery`.
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Section`, `Stack`, `Badge`, `Heading`, `Text`) — no data
 * fetching, no business logic. Real figures are ultimately the
 * backend's Statistics content module (§4, §8); no such endpoint
 * exists on the Public API yet, so this renders frontend-owned Persian
 * placeholder copy in the meantime. Swapping this for a
 * `useStatistics()`-style data hook later is additive —
 * `StatisticsPage` only ever composes `<StatisticsHero />`, never its
 * internals.
 *
 * Brand pass: the eyebrow badge and gold underline now match the same
 * treatment `Hero`/`Features`/`CTA` already use on the homepage, so a
 * visitor landing on this page (e.g. from the header nav) reads it as
 * the same brand system rather than a plainer, disconnected page.
 */
export function StatisticsHero() {
  return (
    <Section spacing="lg" aria-labelledby="statistics-hero-heading">
      <Stack gap="sm" align="start">
        <Badge
          variant="outline"
          className="w-fit rounded-full border-brand-gold/40 bg-brand-gold/10 text-brand-navy"
        >
          آمار و ارقام
        </Badge>
        <Stack gap="xs" align="start">
          <Heading id="statistics-hero-heading" level={1}>
            مجموعه ما در آینه اعداد
          </Heading>
          <span aria-hidden="true" className="block h-1 w-16 rounded-full bg-brand-gold" />
        </Stack>
        <Text variant="lead" className="max-w-2xl">
          متنی نمونه درباره دستاوردهای عددی مجموعه در طول سال‌های
          فعالیت. ارقام واقعی در نهایت از طریق سامانه مدیریت محتوا و
          سرویس عمومی بک‌اند دریافت خواهد شد.
        </Text>
      </Stack>
    </Section>
  );
}

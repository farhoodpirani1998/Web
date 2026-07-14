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
 */
export function StatisticsHero() {
  return (
    <Section spacing="lg" aria-labelledby="statistics-hero-heading">
      <Stack gap="sm">
        <Badge variant="secondary" className="w-fit">
          آمار و ارقام
        </Badge>
        <Heading id="statistics-hero-heading" level={1}>
          مجموعه ما در آینه اعداد
        </Heading>
        <Text variant="lead" className="max-w-2xl">
          متنی نمونه درباره دستاوردهای عددی مجموعه در طول سال‌های
          فعالیت. ارقام واقعی در نهایت از طریق سامانه مدیریت محتوا و
          سرویس عمومی بک‌اند دریافت خواهد شد.
        </Text>
      </Stack>
    </Section>
  );
}

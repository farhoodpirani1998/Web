import { Badge, Heading, Section, Stack, Text } from "@/shared/design-system/components";

/**
 * Events page "Hero" section — first section of the `events` feature,
 * mirroring `@/features/campuses`'s and `@/features/teachers`'s
 * `Hero` sections (which themselves follow the same pattern as
 * `hero`/`about`/`schools`/`pre-registration`'s `Hero` sections).
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Section`, `Stack`, `Badge`, `Heading`, `Text`) — no data
 * fetching, no business logic. Real copy is ultimately the backend's
 * Events content-module data (§4, §8); this renders frontend-owned
 * Persian placeholder copy in the meantime.
 *
 * This feature is deliberately isolated, matching the same "new,
 * isolated feature" scope `@/features/campuses` and
 * `@/features/teachers` were built under — no other feature/page is
 * replaced, renamed, or modified.
 */
export function Hero() {
  return (
    <Section spacing="lg" aria-labelledby="events-hero-heading">
      <Stack gap="sm">
        <Badge variant="secondary" className="w-fit">
          رویدادها
        </Badge>
        <Heading id="events-hero-heading" level={1}>
          رویدادها و برنامه‌های مجموعه ما
        </Heading>
        <Text variant="lead" className="max-w-2xl">
          متنی نمونه درباره رویدادهای پیش‌رو، جشن‌ها، کارگاه‌های آموزشی و بازدیدهای علمی
          مجموعه. زمان، مکان و جزئیات هر رویداد در نهایت از طریق سامانه مدیریت محتوا و
          سرویس عمومی بک‌اند دریافت خواهد شد.
        </Text>
      </Stack>
    </Section>
  );
}

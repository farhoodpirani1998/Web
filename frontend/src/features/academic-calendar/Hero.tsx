import { Badge, Heading, Section, Stack, Text } from "@/shared/design-system/components";

/**
 * Academic Calendar page "Hero" section — first section of the
 * `academic-calendar` feature, following the same pattern as
 * `hero`/`about`/`campuses`/`teachers`/`admissions`'s `Hero` sections.
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Section`, `Stack`, `Badge`, `Heading`, `Text`) — no data
 * fetching, no business logic. Real copy is ultimately the backend's
 * Academic Calendar content-module data (§4, §8); this renders
 * frontend-owned Persian placeholder copy in the meantime.
 *
 * This feature is deliberately isolated, matching the same "new,
 * isolated feature" scope `@/features/campuses`/`@/features/teachers`/
 * `@/features/admissions` were built under — no other feature or page
 * is replaced, renamed, or modified by this work.
 */
export function Hero() {
  return (
    <Section spacing="lg" aria-labelledby="academic-calendar-hero-heading">
      <Stack gap="sm">
        <Badge variant="secondary" className="w-fit">
          تقویم آموزشی
        </Badge>
        <Heading id="academic-calendar-hero-heading" level={1}>
          تقویم سال تحصیلی
        </Heading>
        <Text variant="lead" className="max-w-2xl">
          متنی نمونه درباره تقویم سال تحصیلی، نیم‌سال‌ها، تعطیلات، بازه‌های امتحانی و
          تاریخ‌های مهم مجموعه. تاریخ‌های دقیق و نهایی در نهایت از طریق سامانه مدیریت
          محتوا و سرویس عمومی بک‌اند دریافت خواهد شد.
        </Text>
      </Stack>
    </Section>
  );
}

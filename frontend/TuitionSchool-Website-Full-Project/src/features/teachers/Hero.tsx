import { Badge, Heading, Section, Stack, Text } from "@/shared/design-system/components";

/**
 * Teachers page "Hero" section — first section of the `teachers`
 * feature, mirroring `@/features/campuses`'s `Hero` (which itself
 * follows the same pattern as `hero`/`about`/`schools`/
 * `pre-registration`'s `Hero` sections).
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Section`, `Stack`, `Badge`, `Heading`, `Text`) — no data
 * fetching, no business logic. Real copy is ultimately the backend's
 * Teachers content-module data (§4, §8); this renders frontend-owned
 * Persian placeholder copy in the meantime.
 *
 * This feature is deliberately isolated, matching the same "new,
 * isolated feature" scope `@/features/campuses` was built under —
 * no other feature/page is replaced, renamed, or modified.
 */
export function Hero() {
  return (
    <Section spacing="lg" aria-labelledby="teachers-hero-heading">
      <Stack gap="sm">
        <Badge variant="secondary" className="w-fit">
          کادر آموزشی
        </Badge>
        <Heading id="teachers-hero-heading" level={1}>
          با مدرسان مجموعه ما آشنا شوید
        </Heading>
        <Text variant="lead" className="max-w-2xl">
          متنی نمونه درباره کادر آموزشی مجموعه و تخصص هر یک از مدرسان. سوابق، مدارک تحصیلی
          و حوزه تدریس هر مدرس در نهایت از طریق سامانه مدیریت محتوا و سرویس عمومی بک‌اند
          دریافت خواهد شد.
        </Text>
      </Stack>
    </Section>
  );
}

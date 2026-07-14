import { Badge, Heading, Section, Stack, Text } from "@/shared/design-system/components";

/**
 * Campuses page "Hero" section — first section of the `campuses`
 * feature, following the same pattern as `hero`/`about`/`schools`/
 * `pre-registration`'s `Hero` sections.
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Section`, `Stack`, `Badge`, `Heading`, `Text`) — no data
 * fetching, no business logic. Real copy is ultimately the backend's
 * Campuses content-module data (§4, §8); this renders frontend-owned
 * Persian placeholder copy in the meantime.
 *
 * This feature is deliberately separate from `@/features/schools`
 * (route `/schools`) per this Sprint's explicit scope — it is not a
 * replacement, rename, or data source for that page.
 */
export function Hero() {
  return (
    <Section spacing="lg" aria-labelledby="campuses-hero-heading">
      <Stack gap="sm">
        <Badge variant="secondary" className="w-fit">
          پردیس‌های آموزشی
        </Badge>
        <Heading id="campuses-hero-heading" level={1}>
          پردیس‌ها و امکانات آموزشی ما
        </Heading>
        <Text variant="lead" className="max-w-2xl">
          متنی نمونه درباره پردیس‌های آموزشی مجموعه و امکانات هر یک. آدرس، راه‌های تماس و
          امکانات هر پردیس در نهایت از طریق سامانه مدیریت محتوا و سرویس عمومی بک‌اند
          دریافت خواهد شد.
        </Text>
      </Stack>
    </Section>
  );
}

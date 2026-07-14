import { Heading, Stack, Text } from "@/shared/design-system/components";

/**
 * Contact page "Intro" section — extracted from `ContactPage`'s inline
 * markup without changing layout or styling, following the same
 * pattern as the `hero`/`features`/`cta`/`about` features.
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Stack`, `Heading`, `Text`) — no data fetching, no
 * business logic. Real copy is ultimately Site Settings–derived
 * content (Website Frontend Architecture §8 "Layout Architecture");
 * this renders frontend-owned Persian placeholder copy in the
 * meantime. Swapping this for a `useSiteSettings()`-style data hook
 * later is additive — `ContactPage` only ever composes
 * `<ContactIntro />`, never its internals.
 */
export function ContactIntro() {
  return (
    <Stack gap="sm">
      <Heading level={1}>تماس با ما</Heading>
      <Text variant="lead">
        متن نمونه برای معرفی راه‌های ارتباطی با مجموعه. اطلاعات تماس واقعی
        پس از اتصال به سامانه مدیریت محتوا از سرویس عمومی بک‌اند دریافت
        خواهد شد.
      </Text>
    </Stack>
  );
}

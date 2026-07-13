import { Heading, Section, Stack, Text } from "@/shared/design-system/components";

/**
 * About page "Story" section — extracted from `AboutPage`'s inline
 * markup without changing layout, styling, or content, following the
 * same pattern as the homepage's `hero`/`features`/`cta` features.
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Section`, `Stack`, `Heading`, `Text`) — no data
 * fetching, no business logic. Real copy is ultimately Static
 * Pages/About content-module data (Website Frontend Architecture §4,
 * §8); this renders frontend-owned Persian placeholder copy in the
 * meantime. Swapping this for a `useAboutPage()`-style data hook later
 * is additive — `AboutPage` only ever composes `<AboutStory />`, never
 * its internals.
 */
export function AboutStory() {
  return (
    <Section spacing="lg" aria-labelledby="about-story-heading">
      <Stack gap="md" className="max-w-3xl">
        <Heading id="about-story-heading" level={2}>
          داستان ما
        </Heading>
        <Text>
          متن نمونه درباره شکل‌گیری مجموعه، انگیزه اولیه بنیان‌گذاران و
          مسیری که تا امروز طی شده است. محتوای واقعی این بخش — شامل
          تاریخچه، مأموریت و رسانه‌های پشتیبان — از طریق سامانه مدیریت
          محتوا نگارش و به‌صورت آماده و ترجمه‌شده ارائه خواهد شد.
        </Text>
        <Text>
          پاراگراف نمونه دوم، تا این بخش از صفحه حجم واقعی‌تری از محتوا
          داشته باشد و بتوان فاصله‌گذاری، طول خطوط و ترتیب خوانش را در هر
          دو جهت متن بررسی کرد.
        </Text>
      </Stack>
    </Section>
  );
}

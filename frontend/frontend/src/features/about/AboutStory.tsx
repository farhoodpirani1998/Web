import { Heading, Section, Stack, Text } from "@/shared/design-system/components";

/**
 * About page "Story" section — extracted from `AboutPage`'s inline
 * markup without changing layout, styling, or content, following the
 * same pattern as the homepage's `hero`/`features`/`cta` features.
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Section`, `Stack`, `Badge`, `Heading`, `Text`) — no data
 * fetching, no business logic. Real copy is ultimately Static
 * Pages/About content-module data (Website Frontend Architecture §4,
 * §8); this renders frontend-owned Persian placeholder copy in the
 * meantime. Swapping this for a `useAboutPage()`-style data hook later
 * is additive — `AboutPage` only ever composes `<AboutStory />`, never
 * its internals.
 *
 * Visual refresh: adds the same gold underline accent used under
 * headings elsewhere on this page, and the first paragraph now reads
 * as a `lead`-styled opening line set off by a gold rule (an
 * editorial "pull" treatment, built only from existing tokens) so the
 * two paragraphs read with a clear typographic hierarchy instead of
 * two same-weight blocks of body text. The copy itself — both
 * paragraphs and the heading, verbatim — is unchanged.
 */
export function AboutStory() {
  return (
    <Section spacing="lg" aria-labelledby="about-story-heading">
      <Stack gap="lg" className="max-w-3xl">
        <Stack gap="sm" align="start">
          <Stack gap="xs" align="start">
            <Heading id="about-story-heading" level={2}>
              داستان ما
            </Heading>
            <span aria-hidden="true" className="block h-1 w-16 rounded-full bg-brand-gold" />
          </Stack>
        </Stack>

        <div className="border-s-2 border-brand-gold/40 ps-5">
          <Text variant="lead" className="text-foreground/80">
            متن نمونه درباره شکل‌گیری مجموعه، انگیزه اولیه بنیان‌گذاران و
            مسیری که تا امروز طی شده است. محتوای واقعی این بخش — شامل
            تاریخچه، مأموریت و رسانه‌های پشتیبان — از طریق سامانه مدیریت
            محتوا نگارش و به‌صورت آماده و ترجمه‌شده ارائه خواهد شد.
          </Text>
        </div>

        <Text color="muted">
          پاراگراف نمونه دوم، تا این بخش از صفحه حجم واقعی‌تری از محتوا
          داشته باشد و بتوان فاصله‌گذاری، طول خطوط و ترتیب خوانش را در هر
          دو جهت متن بررسی کرد.
        </Text>
      </Stack>
    </Section>
  );
}

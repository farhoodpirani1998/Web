import { Heading, Section, Stack, Text } from "@/shared/design-system/components";
import { useAboutPage } from "./useAboutPage";
import type { AboutStoryContent } from "./types";

/**
 * Frontend-owned Persian placeholder copy, rendered while
 * `useAboutPage()` is loading, has errored, or the CMS has not
 * published a Story block yet — the same "local literal as fallback"
 * convention `@/features/news`'s `NewsList` established.
 */
const fallbackStory: AboutStoryContent = {
  title: "داستان ما",
  paragraphs: [
    "متن نمونه درباره شکل‌گیری مجموعه، انگیزه اولیه بنیان‌گذاران و " +
      "مسیری که تا امروز طی شده است. محتوای واقعی این بخش — شامل " +
      "تاریخچه، مأموریت و رسانه‌های پشتیبان — از طریق سامانه مدیریت " +
      "محتوا نگارش و به‌صورت آماده و ترجمه‌شده ارائه خواهد شد.",
    "پاراگراف نمونه دوم، تا این بخش از صفحه حجم واقعی‌تری از محتوا " +
      "داشته باشد و بتوان فاصله‌گذاری، طول خطوط و ترتیب خوانش را در هر " +
      "دو جهت متن بررسی کرد.",
  ],
};

/**
 * About page "Story" section, following the same pattern as the
 * homepage's `hero`/`features`/`cta` features and now (as of this
 * extension) also `@/features/news`'s `NewsList`.
 *
 * Backed by `useAboutPage()` (the Public API's Static Pages/About
 * content module, §4, §8): renders `data.story` once the query has
 * resolved, and falls back to `fallbackStory` while the query is
 * loading, has errored, or the CMS has nothing published yet. Only
 * the first paragraph gets the `lead`-styled "pull" treatment,
 * matching the two-paragraph editorial hierarchy this section
 * originally shipped with — any additional CMS-provided paragraphs
 * render as regular muted body text.
 *
 * Visual refresh: adds the same gold underline accent used under
 * headings elsewhere on this page, and the first paragraph now reads
 * as a `lead`-styled opening line set off by a gold rule (an
 * editorial "pull" treatment, built only from existing tokens) so the
 * two paragraphs read with a clear typographic hierarchy instead of
 * two same-weight blocks of body text.
 */
export function AboutStory() {
  const { data } = useAboutPage();
  const story = data?.story ?? fallbackStory;
  const [leadParagraph, ...restParagraphs] = story.paragraphs;

  return (
    <Section spacing="lg" aria-labelledby="about-story-heading">
      <Stack gap="lg" className="max-w-3xl">
        <Stack gap="sm" align="start">
          <Stack gap="xs" align="start">
            <Heading id="about-story-heading" level={2}>
              {story.title}
            </Heading>
            <span aria-hidden="true" className="block h-1 w-16 rounded-full bg-brand-gold" />
          </Stack>
        </Stack>

        {leadParagraph && (
          <div className="border-s-2 border-brand-gold/40 ps-5">
            <Text variant="lead" className="text-foreground/80">
              {leadParagraph}
            </Text>
          </div>
        )}

        {restParagraphs.map((paragraph, index) => (
          <Text key={index} color="muted">
            {paragraph}
          </Text>
        ))}
      </Stack>
    </Section>
  );
}

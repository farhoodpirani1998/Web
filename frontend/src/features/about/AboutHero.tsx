import { Badge, Heading, Section, Stack, Text } from "@/shared/design-system/components";
import { useAboutPage } from "./useAboutPage";
import type { AboutHeroContent } from "./types";

/**
 * Frontend-owned Persian placeholder copy, rendered while
 * `useAboutPage()` is loading, has errored, or the CMS has not
 * published a Hero block yet — the same "local literal as fallback"
 * convention `@/features/news`'s `NewsList` established.
 */
const fallbackHero: AboutHeroContent = {
  eyebrow: "درباره ما",
  title: "با گروه آموزشی ما بیشتر آشنا شوید",
  description:
    "متنی نمونه برای معرفی کلی مجموعه. این پاراگراف جایگزین خلاصه‌ای " +
    "است که در آینده از طریق سامانه مدیریت محتوا و از سرویس عمومی " +
    "بک‌اند دریافت خواهد شد.",
};

/**
 * About page "Hero" section, following the same pattern as the
 * homepage's `hero`/`features`/`cta` features and now (as of this
 * extension) also `@/features/news`'s `NewsList`.
 *
 * Backed by `useAboutPage()` (the Public API's Static Pages/About
 * content module, §4, §8): renders `data.hero` once the query has
 * resolved, and falls back to `fallbackHero` while the query is
 * loading, has errored, or the CMS has nothing published yet.
 *
 * Visual refresh: adopts the same gold-badge/underline eyebrow
 * treatment and soft gradient backdrop already established by the
 * homepage `Hero`/`Features` sections (and now `GalleryHero`/
 * `NewsHero`), so this page reads as part of the same premium
 * navy/gold system instead of a plain text block. Still zero new
 * dependencies — the backdrop is a plain `aria-hidden` `div` built
 * from existing tokens, the same technique `Hero` already uses.
 */
export function AboutHero() {
  const { data } = useAboutPage();
  const hero = data?.hero ?? fallbackHero;

  return (
    <Section
      spacing="lg"
      aria-labelledby="about-hero-heading"
      className="relative isolate overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 rounded-[2.5rem] bg-gradient-to-b from-muted/70 via-muted/15 to-transparent"
      />

      <Stack gap="sm" align="start" className="max-w-2xl">
        {hero.eyebrow && (
          <Badge
            variant="outline"
            className="w-fit gap-1.5 rounded-full border-brand-gold/40 bg-brand-gold/10 px-3 py-1 text-brand-navy"
          >
            {hero.eyebrow}
          </Badge>
        )}

        <Stack gap="xs" align="start">
          <Heading id="about-hero-heading" level={1}>
            {hero.title}
          </Heading>
          <span aria-hidden="true" className="block h-1 w-16 rounded-full bg-brand-gold" />
        </Stack>

        <Text variant="lead" className="max-w-2xl text-foreground/70">
          {hero.description}
        </Text>
      </Stack>
    </Section>
  );
}

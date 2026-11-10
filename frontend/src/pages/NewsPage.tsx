import { PageLayout, Stack } from "@/shared/design-system/components";
import { Seo } from "@/shared/seo";
import { NewsHero, NewsList, NewsDetails, FAQ } from "@/features/news";

/** Static page-level SEO metadata for the news directory. */
const NEWS_SEO = {
  title: "اخبار و اطلاعیه‌ها",
  description: "آخرین اخبار، اطلاعیه‌ها و دستاوردهای مجموعه را دنبال کنید.",
  canonicalUrl: `${window.location.origin}/news`,
  robots: "index, follow",
};

/**
 * News directory backed by the Public News API through `useNews()`.
 * Individual article routes load their full detail response separately.
 */
export function NewsPage() {
  return (
    <>
      <Seo seo={NEWS_SEO} />

      {/* Full-bleed hero band, outside PageLayout (which is a Container). */}
      <NewsHero />

      <PageLayout>
        <Stack gap="none">
          <NewsList />
          <NewsDetails />
          <FAQ />
        </Stack>
      </PageLayout>
    </>
  );
}

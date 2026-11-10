import { PageLayout, Separator, Stack } from "@/shared/design-system/components";
import { Seo } from "@/shared/seo";
import {
  AboutHero,
  AboutStats,
  AboutStory,
  AboutValues,
  AboutTimeline,
  AboutTeam,
  AboutFAQ,
  useAboutPage,
} from "@/features/about";

/**
 * Fixed `/about` page backed by the CMS About API through
 * `useAboutPage()`. Sections without published content are omitted.
 */
export function AboutPage() {
  const { data, isLoading, error } = useAboutPage();

  if (isLoading) {
    return (
      <PageLayout>
        <p role="status" className="py-12 text-center text-muted-foreground">
          در حال بارگذاری صفحه درباره ما…
        </p>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <p role="alert" className="py-12 text-center text-destructive">
          بارگذاری صفحه درباره ما ناموفق بود: {error.message}
        </p>
      </PageLayout>
    );
  }

  if (!data) {
    return (
      <PageLayout>
        <p role="alert" className="py-12 text-center text-destructive">
          محتوای صفحه درباره ما در دسترس نیست.
        </p>
      </PageLayout>
    );
  }

  return (
    <>
      <Seo seo={data.seo} structuredData={data.structuredData} />

      {/* Full-bleed hero band, outside PageLayout (which is a Container). */}
      <AboutHero />

      <PageLayout>
        <Stack gap="none">
          <AboutStats />
          <AboutStory />
          <AboutValues />
          <AboutTimeline />

          <Separator className="my-2" />

          <AboutTeam />
          <AboutFAQ />
        </Stack>
      </PageLayout>
    </>
  );
}

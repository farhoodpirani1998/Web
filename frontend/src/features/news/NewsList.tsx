import { Grid, Section, SectionHeader, Stack, ErrorState, EmptyState } from "@/shared/design-system/components";
import { NewsCard } from "./NewsCard";
import { NewsCardSkeleton } from "./NewsCardSkeleton";
import { useNews } from "./useNews";

/**
 * News page "List" section — the news/announcement directory,
 * following the same pattern as `hero`/`features`/`cta`/`about`/
 * `contact`/`schools`, and now (as of this extension) also mirroring
 * `@/features/campuses`'s `CampusList`, `@/features/teachers`'s
 * `TeacherGrid`, and `@/features/gallery`'s `GalleryGrid`.
 *
 * Backed by `useNews()` (the Public API's News content module, §4,
 * §8): lays out `data.news` (assumed newest-first) with explicit
 * loading, error, and empty states. Shows one editorial
 * lead story (full-width) followed by remaining items in a 3-column
 * grid — the same "one lead + regular grid" hierarchy premium news
 * pages use.
 *
 * Visual refresh: the heading now carries the same gold-badge/
 * underline eyebrow treatment the homepage `Features` section and
 * `GalleryGrid` already use.
 *
 * Cards link to `NewsDetails`'s on-page anchor. Individual article
 * slugs are handled by the explicit `NewsDetailPage` route.
 */
export function NewsList({ campusId }: { campusId?: string }) {
  const { data, isPending, isError } = useNews(campusId);
  const items = data ?? [];
  const [leadStory, ...restStories] = items;

  return (
    <Section spacing="lg" aria-labelledby="news-list-heading">
      <Stack gap="xl">
        <SectionHeader
          headingId="news-list-heading"
          align="center"
          eyebrow="آخرین مطالب"
          title={campusId ? "اخبار این مدرسه" : "فهرست اخبار"}
          description={
            campusId
              ? undefined
              : "تازه‌ترین اطلاعیه‌ها، رویدادها و دستاوردهای مجموعه را اینجا دنبال کنید."
          }
        />

        {isPending ? (
          <Stack gap="lg">
            <NewsCardSkeleton featured />
            <Grid cols="3" gap="md">
              {[...Array(5)].map((_, i) => (
                <NewsCardSkeleton key={i} />
              ))}
            </Grid>
          </Stack>
        ) : isError ? (
          <ErrorState
            title="دریافت اخبار ناموفق بود"
            description="لطفاً بعداً دوباره تلاش کنید."
            onRetry={() => window.location.reload()}
            retryLabel="تلاش مجدد"
          />
        ) : items.length > 0 ? (
          <Stack gap="lg">
            {leadStory && <NewsCard item={leadStory} featured />}

            {restStories.length > 0 && (
              <Grid cols="3" gap="md">
                {restStories.map((item) => (
                  <NewsCard key={item.id} item={item} />
                ))}
              </Grid>
            )}
          </Stack>
        ) : (
          <EmptyState
            title="خبری برای نمایش وجود ندارد"
            description="در حال حاضر خبری منتشرشده‌ای موجود نیست."
          />
        )}
      </Stack>
    </Section>
  );
}

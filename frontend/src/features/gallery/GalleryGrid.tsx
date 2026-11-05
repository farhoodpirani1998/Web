import { Badge, Grid, Heading, Section, Stack, Text, ErrorState, EmptyState, LoadingState } from "@/shared/design-system/components";
import { GalleryCard } from "./GalleryCard";
import { useGallery } from "./useGallery";

/**
 * Gallery page "Grid" section — the image directory, following the
 * same pattern as `hero`/`features`/`cta`/`about`/`contact`/`schools`/
 * `news`, and now (as of this extension) also mirroring
 * `@/features/campuses`'s `CampusList` and `@/features/teachers`'s
 * `TeacherGrid`.
 *
 * Backed by `useGallery()` (the Public API's Gallery/Media content
 * module, §4, §8): lays out `data.gallery` with explicit loading, error,
 * and empty states (Phase 2) rather than silently falling back to
 * placeholder data.
 */
export function GalleryGrid() {
  const { data, isPending, isError } = useGallery();
  const items = data ?? [];

  return (
    <Section spacing="lg" aria-labelledby="gallery-grid-heading">
      <Stack gap="xl">
        <Stack gap="sm" align="center" className="text-center">
          <Badge
            variant="outline"
            className="w-fit rounded-full border-brand-gold/40 bg-brand-gold/10 text-brand-navy"
          >
            مجموعه تصاویر
          </Badge>
          <Heading id="gallery-grid-heading" level={2}>
            تصاویر گالری
          </Heading>
          <span aria-hidden="true" className="block h-1 w-16 rounded-full bg-brand-gold" />
          <Text variant="lead" className="max-w-2xl">
            گزیده‌ای از تصاویر فضای آموزشی، رویدادها و دستاوردهای شعب مختلف مجموعه.
          </Text>
        </Stack>

        {isPending ? (
          <LoadingState label="درحال دریافت تصاویر…" />
        ) : isError ? (
          <ErrorState
            title="دریافت تصاویر ناموفق بود"
            description="لطفاً بعداً دوباره تلاش کنید."
            onRetry={() => window.location.reload()}
            retryLabel="تلاش مجدد"
          />
        ) : items.length > 0 ? (
          <Grid cols="4" gap="lg">
            {items.map((item) => (
              <GalleryCard key={item.id} item={item} />
            ))}
          </Grid>
        ) : (
          <EmptyState
            title="تصویری برای نمایش وجود ندارد"
            description="در حال حاضر تصویری منتشرشده‌ای موجود نیست."
          />
        )}
      </Stack>
    </Section>
  );
}

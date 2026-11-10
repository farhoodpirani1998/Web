import { Grid, Heading, Section, Stack, Text, EmptyState, ErrorState, LoadingState } from "@/shared/design-system/components";
import { CampusCard } from "./CampusCard";
import { useCampuses } from "./useCampuses";

/**
 * Campuses page "List" section — the compact overview grid, following
 * the same pattern as `SchoolsList`/`GalleryGrid`/`Information`
 * (§4, §8, §10 "Section Architecture"), and now (as of this
 * extension) also mirroring `@/features/news`'s `NewsList` and
 * `@/features/gallery`'s `GalleryGrid`.
 *
 * Backed by `useCampuses()` (the Public API's Campuses content
 * module, §4, §8): lays out only published API data, with explicit
 * loading, error, and empty states rather than local placeholder
 * records.
 *
 * Visual refresh: adds a short lead paragraph under the heading (the
 * same heading+lead pairing `AboutTeam`/`AboutValues` use) so the
 * section reads with the same hierarchy as the rest of the premium
 * page, and widens the card gap from `md` to `lg` to give the taller
 * `elevated` `CampusCard`s room to breathe.
 */
export function CampusList() {
  const { data, isPending, isError } = useCampuses();
  const campuses = data ?? [];

  return (
    <Section spacing="lg" aria-labelledby="campuses-list-heading">
      <Stack gap="md">
        <Stack gap="sm">
          <Heading id="campuses-list-heading" level={2}>
            فهرست پردیس‌ها
          </Heading>
          <Text variant="lead" className="max-w-2xl">
            پردیس‌های منتشرشده‌ی مجموعه و اطلاعات هر یک را ببینید.
          </Text>
        </Stack>
        {isPending ? (
          <LoadingState label="درحال دریافت پردیس‌ها…" />
        ) : isError ? (
          <ErrorState
            title="دریافت اطلاعات پردیس‌ها ناموفق بود"
            description="لطفاً بعداً دوباره تلاش کنید."
            onRetry={() => window.location.reload()}
            retryLabel="تلاش مجدد"
          />
        ) : campuses.length > 0 ? (
          <Grid cols="3" gap="lg">
            {campuses.map((campus) => (
              <CampusCard key={campus.id} campus={campus} />
            ))}
          </Grid>
        ) : (
          <EmptyState
            title="پردیسی برای نمایش وجود ندارد"
            description="در حال حاضر پردیس منتشرشده‌ای موجود نیست."
          />
        )}
      </Stack>
    </Section>
  );
}

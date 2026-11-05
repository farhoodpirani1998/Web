import { Grid, Heading, Section, Stack, Text, ErrorState, EmptyState, LoadingState } from "@/shared/design-system/components";
import { EventCard } from "./EventCard";
import { useEvents } from "./useEvents";

/**
 * Events page "List" section — the compact overview grid, mirroring
 * `@/features/campuses`'s `CampusList` and `@/features/teachers`'s
 * `TeacherGrid` (themselves following the same pattern as
 * `SchoolsList`/`GalleryGrid`/`Information`, §4, §8, §10 "Section
 * Architecture").
 *
 * Backed by `useEvents()` (the Public API's Events content module,
 * §4, §8): lays out `data.events` with explicit loading, error, and
 * empty states (Phase 2) rather than silently falling back to
 * placeholder data.
 */
export function EventList() {
  const { data, isPending, isError } = useEvents();
  const items = data ?? [];

  return (
    <Section spacing="lg" aria-labelledby="events-list-heading">
      <Stack gap="md">
        <Stack gap="sm">
          <Heading id="events-list-heading" level={2}>
            فهرست رویدادها
          </Heading>
          <Text variant="lead" className="max-w-2xl">
            متن نمونه برای معرفی رویدادهای پیش‌رو و برنامه‌های مجموعه.
          </Text>
        </Stack>
        {isPending ? (
          <LoadingState label="درحال دریافت رویدادها…" />
        ) : isError ? (
          <ErrorState
            title="دریافت رویدادها ناموفق بود"
            description="لطفاً بعداً دوباره تلاش کنید."
            onRetry={() => window.location.reload()}
            retryLabel="تلاش مجدد"
          />
        ) : items.length > 0 ? (
          <Grid cols="3" gap="lg">
            {items.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </Grid>
        ) : (
          <EmptyState
            title="رویدادی برای نمایش وجود ندارد"
            description="در حال حاضر رویدادی منتشرشده‌ای موجود نیست."
          />
        )}
      </Stack>
    </Section>
  );
}

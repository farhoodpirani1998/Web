import { Grid, Heading, Section, Stack, Text } from "@/shared/design-system/components";
import { EventCard } from "./EventCard";
import { events } from "./data";
import { useEvents } from "./useEvents";

/**
 * Events page "List" section — the compact overview grid, mirroring
 * `@/features/campuses`'s `CampusList` and `@/features/teachers`'s
 * `TeacherGrid` (themselves following the same pattern as
 * `SchoolsList`/`GalleryGrid`/`Information`, §4, §8, §10 "Section
 * Architecture").
 *
 * Backed by `useEvents()` (the Public API's Events content module,
 * §4, §8): lays out `data.events` when the query has resolved with at
 * least one item, and falls back to the local `events` placeholder
 * array (`./data`) while the query is loading, has errored, or the
 * CMS has nothing published yet.
 */
export function EventList() {
  const { data } = useEvents();
  const items = data && data.length > 0 ? data : events;

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
        <Grid cols="3" gap="lg">
          {items.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </Grid>
      </Stack>
    </Section>
  );
}

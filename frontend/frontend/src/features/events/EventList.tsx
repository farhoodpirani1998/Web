import { Grid, Heading, Section, Stack, Text } from "@/shared/design-system/components";
import { EventCard } from "./EventCard";
import { events } from "./data";

/**
 * Events page "List" section — the compact overview grid, mirroring
 * `@/features/campuses`'s `CampusList` and `@/features/teachers`'s
 * `TeacherGrid` (themselves following the same pattern as
 * `SchoolsList`/`GalleryGrid`/`Information`, §4, §8, §10 "Section
 * Architecture").
 *
 * Presentation only: composed from `Section`/`Stack`/`Grid` plus this
 * feature's own `EventCard`, over the local `events` literal
 * (`./data`) — no data fetching, no business logic. Swapping `./data`
 * for a `useEvents()`-style data hook later is additive; this
 * component's JSX does not need to change.
 *
 * Visual refresh: adds a short lead paragraph under the heading (the
 * same heading+lead pairing `CampusList`/`TeacherGrid` use) and
 * widens the card gap from `md` to `lg` to give the taller `elevated`
 * `EventCard`s room to breathe.
 */
export function EventList() {
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
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </Grid>
      </Stack>
    </Section>
  );
}

import { Grid, Heading, Section, Stack, Text } from "@/shared/design-system/components";
import { CampusCard } from "./CampusCard";
import { campuses } from "./data";

/**
 * Campuses page "List" section — the compact overview grid, following
 * the same pattern as `SchoolsList`/`GalleryGrid`/`Information`
 * (§4, §8, §10 "Section Architecture").
 *
 * Presentation only: composed from `Section`/`Stack`/`Grid` plus this
 * feature's own `CampusCard`, over the local `campuses` literal
 * (`./data`) — no data fetching, no business logic. Swapping `./data`
 * for a `useCampuses()`-style data hook later is additive; this
 * component's JSX does not need to change.
 *
 * Visual refresh: adds a short lead paragraph under the heading (the
 * same heading+lead pairing `AboutTeam`/`AboutValues` use) so the
 * section reads with the same hierarchy as the rest of the premium
 * page, and widens the card gap from `md` to `lg` to give the taller
 * `elevated` `CampusCard`s room to breathe.
 */
export function CampusList() {
  return (
    <Section spacing="lg" aria-labelledby="campuses-list-heading">
      <Stack gap="md">
        <Stack gap="sm">
          <Heading id="campuses-list-heading" level={2}>
            فهرست پردیس‌ها
          </Heading>
          <Text variant="lead" className="max-w-2xl">
            متن نمونه برای معرفی پردیس‌های فعال مجموعه در شهرهای مختلف.
          </Text>
        </Stack>
        <Grid cols="3" gap="lg">
          {campuses.map((campus) => (
            <CampusCard key={campus.id} campus={campus} />
          ))}
        </Grid>
      </Stack>
    </Section>
  );
}

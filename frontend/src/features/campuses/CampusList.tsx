import { Grid, Heading, Section, Stack, Text } from "@/shared/design-system/components";
import { CampusCard } from "./CampusCard";
import { campuses as fallbackCampuses } from "./data";
import { useCampuses } from "./useCampuses";

/**
 * Campuses page "List" section — the compact overview grid, following
 * the same pattern as `SchoolsList`/`GalleryGrid`/`Information`
 * (§4, §8, §10 "Section Architecture"), and now (as of this
 * extension) also mirroring `@/features/news`'s `NewsList` and
 * `@/features/gallery`'s `GalleryGrid`.
 *
 * Backed by `useCampuses()` (the Public API's Campuses content
 * module, §4, §8): lays out `data` when the query has resolved with
 * at least one item, and falls back to the local `fallbackCampuses`
 * placeholder array (`./data`) while the query is loading, has
 * errored, or the CMS has nothing published yet.
 *
 * Visual refresh: adds a short lead paragraph under the heading (the
 * same heading+lead pairing `AboutTeam`/`AboutValues` use) so the
 * section reads with the same hierarchy as the rest of the premium
 * page, and widens the card gap from `md` to `lg` to give the taller
 * `elevated` `CampusCard`s room to breathe.
 */
export function CampusList() {
  const { data } = useCampuses();
  const campuses = data && data.length > 0 ? data : fallbackCampuses;

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

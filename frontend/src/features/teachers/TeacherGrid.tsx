import { Grid, Heading, Section, Stack, Text } from "@/shared/design-system/components";
import { TeacherCard } from "./TeacherCard";
import { teachers as fallbackTeachers } from "./data";
import { useTeachers } from "./useTeachers";

/**
 * Teachers page "Grid" section — the teacher directory, mirroring
 * `@/features/campuses`'s `CampusList` (itself following the same
 * pattern as `SchoolsList`/`GalleryGrid`/`Information`, §4, §8, §10
 * "Section Architecture").
 *
 * Backed by `useTeachers()` (the Public API's Teachers content
 * module, §4, §8): lays out `data` when the query has resolved with
 * at least one item, and falls back to the local `fallbackTeachers`
 * placeholder array (`./data`) while the query is loading, has
 * errored, or the CMS has nothing published yet — the same convention
 * `@/features/campuses`'s `CampusList` now uses.
 *
 * Visual refresh: adds a short lead paragraph under the heading (the
 * same heading+lead pairing `AboutTeam`/`AboutValues`/`CampusList`
 * use) and widens the card gap from `md` to `lg` to give the taller
 * portrait-style `TeacherCard`s room to breathe.
 */
export function TeacherGrid() {
  const { data } = useTeachers();
  const teachers = data && data.length > 0 ? data : fallbackTeachers;

  return (
    <Section spacing="lg" aria-labelledby="teachers-grid-heading">
      <Stack gap="md">
        <Stack gap="sm">
          <Heading id="teachers-grid-heading" level={2}>
            فهرست مدرسان
          </Heading>
          <Text variant="lead" className="max-w-2xl">
            متن نمونه برای معرفی مدرسان مجموعه به تفکیک درس و تخصص.
          </Text>
        </Stack>
        <Grid cols="4" gap="lg">
          {teachers.map((teacher) => (
            <TeacherCard key={teacher.id} teacher={teacher} />
          ))}
        </Grid>
      </Stack>
    </Section>
  );
}

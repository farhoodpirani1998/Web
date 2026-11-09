import { Grid, Heading, Section, Stack, Text, ErrorState, EmptyState } from "@/shared/design-system/components";
import { TeacherCard } from "./TeacherCard";
import { TeacherCardSkeleton } from "./TeacherCardSkeleton";
import { useTeachers } from "./useTeachers";

/**
 * Teachers page "Grid" section — the teacher directory, mirroring
 * `@/features/campuses`'s `CampusList` (itself following the same
 * pattern as `SchoolsList`/`GalleryGrid`/`Information`, §4, §8, §10
 * "Section Architecture").
 *
 * Backed by `useTeachers()` (the Public API's Teachers content
 * module, §4, §8): lays out `data` with explicit loading, error, and
 * empty states (Phase 2) rather than silently falling back to placeholder
 * data. Shows user feedback at each step of the data lifecycle.
 *
 * Visual refresh: adds a short lead paragraph under the heading (the
 * same heading+lead pairing `AboutTeam`/`AboutValues`/`CampusList`
 * use) and widens the card gap from `md` to `lg` to give the taller
 * portrait-style `TeacherCard`s room to breathe.
 */
export function TeacherGrid({ campusId }: { campusId?: string }) {
  const { data, isPending, isError } = useTeachers(campusId);
  const teachers = data ?? [];

  return (
    <Section spacing="lg" aria-labelledby="teachers-grid-heading">
      <Stack gap="md">
        <Stack gap="sm">
          <Heading id="teachers-grid-heading" level={2}>
            {campusId ? "مدرسان این مدرسه" : "فهرست مدرسان"}
          </Heading>
          {!campusId ? (
            <Text variant="lead" className="max-w-2xl">
              متن نمونه برای معرفی مدرسان مجموعه به تفکیک درس و تخصص.
            </Text>
          ) : null}
        </Stack>
        {isPending ? (
          <Grid cols="4" gap="lg">
            {[...Array(8)].map((_, i) => (
              <TeacherCardSkeleton key={i} />
            ))}
          </Grid>
        ) : isError ? (
          <ErrorState
            title="دریافت اطلاعات مدرسان ناموفق بود"
            description="لطفاً بعداً دوباره تلاش کنید."
            onRetry={() => window.location.reload()}
            retryLabel="تلاش مجدد"
          />
        ) : teachers.length > 0 ? (
          <Grid cols="4" gap="lg">
            {teachers.map((teacher) => (
              <TeacherCard key={teacher.id} teacher={teacher} />
            ))}
          </Grid>
        ) : (
          <EmptyState
            title="مدرسی برای نمایش وجود ندارد"
            description="در حال حاضر مدرسی منتشرشده‌ای موجود نیست."
          />
        )}
      </Stack>
    </Section>
  );
}

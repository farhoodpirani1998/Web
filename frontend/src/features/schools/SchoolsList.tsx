import {
  EmptyState,
  ErrorState,
  Grid,
  LoadingState,
  Section,
  SectionHeader,
  Stack,
} from "@/shared/design-system/components";

import { CampusCard, useCampuses } from "@/features/campuses";

export function SchoolsList() {
  const { data, isPending, isError, refetch } = useCampuses();

  return (
    <Section spacing="lg" aria-labelledby="schools-list-heading">
      <Stack gap="xl">
        <SectionHeader
          headingId="schools-list-heading"
          eyebrow="مدارس و پردیس‌ها"
          title="مدارس گروه آموزشی"
          description="مدارس گروه را ببینید و برای آشنایی بیشتر با هر مدرسه وارد صفحه آن شوید."
        />

        {isPending ? (
          <LoadingState label="در حال دریافت فهرست مدارس…" />
        ) : isError ? (
          <ErrorState
            title="دریافت فهرست مدارس ناموفق بود"
            description="لطفاً بعداً دوباره تلاش کنید."
            onRetry={() => void refetch()}
          />
        ) : data.length > 0 ? (
          <Grid cols="3" gap="lg">
            {data.map((campus) => (
              <CampusCard key={campus.id} campus={campus} hrefPrefix="schools" />
            ))}
          </Grid>
        ) : (
          <EmptyState
            title="مدرسه‌ای برای نمایش وجود ندارد"
            description="در حال حاضر مدرسه منتشرشده‌ای در فهرست موجود نیست."
          />
        )}
      </Stack>
    </Section>
  );
}

import { useParams } from "react-router-dom";

import {
  Container,
  ErrorState,
  Heading,
  Image,
  LoadingState,
  PageLayout,
  Stack,
  Text,
} from "@/shared/design-system/components";
import { Seo } from "@/shared/seo";
import { useEventBySlug } from "@/features/events";
import { formatPersianDate, formatPersianTime } from "@/shared/utils/formatDate";
import type { PublicEventDetailDto } from "@/features/events";

/**
 * Event detail page — route `/events/:slug` (added alongside this
 * page in `@/app/routes/router.tsx`). Mirrors
 * `@/pages/NewsDetailPage` exactly (see that file's doc comment for
 * the full rationale) — same slug-addressed, query-backed, `<Seo />`-
 * rendering pattern, swapped to `@/features/events`'s
 * `useEventBySlug`/`fetchEventBySlug` (`GET /events/:slug`).
 *
 * Date/schedule rendering: same "تمام روز" / "start تا end" / "start
 * only" logic `@/features/events/api.ts`'s (private) `formatEventTime`
 * already encodes for the list/card view, reproduced here directly
 * since that helper isn't exported — see `formatSchedule` below.
 */
export function EventDetailPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { data, isLoading, isError, refetch } = useEventBySlug(slug);

  return (
    <PageLayout>
      <Seo seo={data?.seo} structuredData={data?.structuredData} />

      {isLoading && <LoadingState label="در حال بارگذاری رویداد" />}

      {isError && (
        <ErrorState
          title="رویداد یافت نشد"
          description="بارگذاری این رویداد با مشکل مواجه شد. لطفاً دوباره تلاش کنید."
          onRetry={() => void refetch()}
        />
      )}

      {data && (
        <Container>
          <Stack gap="lg" className="py-8">
            {data.featuredImage && (
              <Image
                src={data.featuredImage.url}
                alt={data.featuredImage.altText}
                ratio={16 / 9}
                loading="eager"
              />
            )}

            <Stack gap="xs">
              <Heading level={1}>{data.title.fa}</Heading>
              <Text as="span" variant="caption" color="muted">
                {formatPersianDate(data.startAt)} — {formatSchedule(data)}
              </Text>
            </Stack>

            <Text variant="body">{data.body.fa}</Text>
          </Stack>
        </Container>
      )}
    </PageLayout>
  );
}

/**
 * Renders `startAt`/`endAt`/`allDay` into the single human-readable
 * "time" string shown alongside `date` — same logic as
 * `@/features/events/api.ts`'s (private, not exported) `formatEventTime`.
 */
function formatSchedule(dto: PublicEventDetailDto): string {
  if (dto.allDay) return "تمام روز";

  const start = formatPersianTime(dto.startAt);
  const end = dto.endAt ? formatPersianTime(dto.endAt) : "";

  return end ? `${start} تا ${end}` : start;
}

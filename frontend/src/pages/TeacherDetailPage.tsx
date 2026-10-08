import { useParams } from "react-router-dom";

import {
  Container,
  ErrorState,
  Heading,
  Image,
  LoadingState,
  Link,
  PageLayout,
  Stack,
  Text,
} from "@/shared/design-system/components";
import { Seo } from "@/shared/seo";
import { useTeacherBySlug } from "@/features/teachers";

/**
 * Teacher detail page — route `/teachers/:slug` (added alongside this
 * page in `@/app/routes/router.tsx`). Mirrors `@/pages/NewsDetailPage`,
 * `@/pages/EventDetailPage`, and `@/pages/CampusDetailPage` exactly
 * (see those files' doc comments for the full rationale) — same
 * slug-addressed, query-backed, `<Seo />`-rendering pattern, swapped
 * to `@/features/teachers`'s `useTeacherBySlug`/`fetchTeacherBySlug`
 * (`GET /teachers/:slug`).
 *
 * Teacher information fields (`department`/`phone`/`email`) are all
 * optional on the backend entity (see `@/features/teachers/types.ts`'s
 * doc comment) — each renders conditionally, same "degrade
 * gracefully" approach `TeacherCard`/`TeacherDetails` already use for
 * these same fields.
 */
export function TeacherDetailPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { data, isLoading, isError, refetch } = useTeacherBySlug(slug);

  return (
    <PageLayout>
      <Seo seo={data?.seo} structuredData={data?.structuredData} />

      {isLoading && <LoadingState label="در حال بارگذاری معلم" />}

      {isError && (
        <ErrorState
          title="معلم یافت نشد"
          description="بارگذاری این صفحه با مشکل مواجه شد. لطفاً دوباره تلاش کنید."
          onRetry={() => void refetch()}
        />
      )}

      {data && (
        <Container>
          <Stack gap="lg" className="py-8">
            {data.avatar && (
              <Image
                src={data.avatar.url}
                alt={data.avatar.altText}
                ratio={1}
                loading="eager"
                className="max-w-xs"
              />
            )}

            <Stack gap="xs">
              <Heading level={1}>{data.fullName}</Heading>
              <Text as="span" variant="body" color="muted">
                {data.jobTitle.fa}
              </Text>
            </Stack>

            {(data.department || data.phone || data.email) && (
              <Stack gap="xs">
                {data.department && (
                  <Text as="span" variant="bodySm" color="muted">
                    {data.department.fa}
                  </Text>
                )}
                {data.phone && (
                  <Link href={`tel:${data.phone}`} variant="default">
                    {data.phone}
                  </Link>
                )}
                {data.email && (
                  <Link href={`mailto:${data.email}`} variant="default">
                    {data.email}
                  </Link>
                )}
              </Stack>
            )}

            <Text variant="body">{data.bio.fa}</Text>
          </Stack>
        </Container>
      )}
    </PageLayout>
  );
}

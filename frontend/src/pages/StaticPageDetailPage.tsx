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
import { useStaticPageBySlug } from "@/features/static-pages";

/**
 * Static Page detail page — route `/pages/:slug` (added alongside
 * this page in `@/app/routes/router.tsx`). Mirrors
 * `@/pages/NewsDetailPage`, `@/pages/EventDetailPage`,
 * `@/pages/CampusDetailPage`, and `@/pages/TeacherDetailPage` exactly
 * (see those files' doc comments for the full rationale) — same
 * slug-addressed, query-backed, `<Seo />`-rendering pattern, swapped
 * to `@/features/static-pages`'s
 * `useStaticPageBySlug`/`fetchStaticPageBySlug` (`GET /pages/:slug`).
 *
 * This is the first page/component to consume `@/features/static-pages`
 * (added as fetch-only infrastructure in an earlier sprint) — no
 * `template`-specific layout switch is implemented here; every
 * `PageTemplate` renders through this same title/image/body shape,
 * matching the "no UI" scope this sprint was given.
 */
export function StaticPageDetailPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { data, isLoading, isError, refetch } = useStaticPageBySlug(slug);

  return (
    <PageLayout>
      <Seo seo={data?.seo} structuredData={data?.structuredData} />

      {isLoading && <LoadingState label="در حال بارگذاری صفحه" />}

      {isError && (
        <ErrorState
          title="صفحه یافت نشد"
          description="بارگذاری این صفحه با مشکل مواجه شد. لطفاً دوباره تلاش کنید."
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

            <Heading level={1}>{data.title.fa}</Heading>

            <Text variant="body">{data.body.fa}</Text>
          </Stack>
        </Container>
      )}
    </PageLayout>
  );
}

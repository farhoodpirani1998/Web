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
import { useCampusBySlug } from "@/features/campuses";

/**
 * Campus detail page — route `/campuses/:slug` (added alongside this
 * page in `@/app/routes/router.tsx`). Mirrors `@/pages/NewsDetailPage`
 * and `@/pages/EventDetailPage` exactly (see those files' doc
 * comments for the full rationale) — same slug-addressed, query-
 * backed, `<Seo />`-rendering pattern, swapped to
 * `@/features/campuses`'s `useCampusBySlug`/`fetchCampusBySlug`
 * (`GET /campuses/:slug`).
 *
 * Campus information fields (`address`/`phone`/`email`/`mapUrl`) are
 * all optional on the backend entity (see
 * `@/features/campuses/types.ts`'s doc comment) — each renders
 * conditionally, same "degrade gracefully" approach `CampusCard`/
 * `CampusDetails` already use for these same fields.
 */
export function CampusDetailPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { data, isLoading, isError, refetch } = useCampusBySlug(slug);

  return (
    <PageLayout>
      <Seo seo={data?.seo} structuredData={data?.structuredData} />

      {isLoading && <LoadingState label="در حال بارگذاری شعبه" />}

      {isError && (
        <ErrorState
          title="شعبه یافت نشد"
          description="بارگذاری این شعبه با مشکل مواجه شد. لطفاً دوباره تلاش کنید."
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

            {(data.address || data.phone || data.email || data.mapUrl) && (
              <Stack gap="xs">
                {data.address && (
                  <Text as="span" variant="bodySm" color="muted">
                    {data.address.fa}
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
                {data.mapUrl && (
                  <Link href={data.mapUrl} variant="default" target="_blank" rel="noreferrer">
                    مشاهده روی نقشه
                  </Link>
                )}
              </Stack>
            )}

            <Text variant="body">{data.body.fa}</Text>
          </Stack>
        </Container>
      )}
    </PageLayout>
  );
}

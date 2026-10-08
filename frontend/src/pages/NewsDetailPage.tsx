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
import { useNewsBySlug } from "@/features/news";
import { formatPersianDate } from "@/shared/utils/formatDate";

/**
 * News article detail page — route `/news/:slug` (added alongside
 * this page in `@/app/routes/router.tsx`).
 *
 * Unlike `NewsPage` (the fixed `/news` listing page, which renders
 * every article inline via `NewsDetails`'s `<details>` disclosure —
 * see that file's doc comment on why no per-article route existed
 * until now), this page is slug-addressed: it reads `:slug` from the
 * route and fetches that one article's full detail response via
 * `@/features/news`'s `useNewsBySlug` (backed by `fetchNewsBySlug`,
 * `GET /news/:slug`).
 *
 * Renders the shared `<Seo />` component (`@/shared/seo`, §21) with
 * the query's `seo`/`structuredData` fields, unchanged from what the
 * backend returns — same convention as `AboutPage`.
 *
 * Loading/error states use the shared `LoadingState`/`ErrorState`
 * primitives (§12, §13, §19), same as any other query-backed section;
 * a missing/not-found article surfaces through `ErrorState` since
 * `fetchNewsBySlug` throws a normalized `ApiError` for a 404, same as
 * every other Public API request.
 *
 * Persian-first, same as every other page (§28): copy is authored
 * directly in Persian, and layout relies on logical properties /
 * direction-agnostic primitives so it holds up under the app's
 * `dir="rtl"` root as well as a future `ltr` locale.
 */
export function NewsDetailPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { data, isLoading, isError, refetch } = useNewsBySlug(slug);

  return (
    <PageLayout>
      <Seo seo={data?.seo} structuredData={data?.structuredData} />

      {isLoading && <LoadingState label="در حال بارگذاری خبر" />}

      {isError && (
        <ErrorState
          title="خبر یافت نشد"
          description="بارگذاری این خبر با مشکل مواجه شد. لطفاً دوباره تلاش کنید."
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
                {formatPersianDate(data.publishAt)}
              </Text>
            </Stack>

            <Text variant="body">{data.body.fa}</Text>
          </Stack>
        </Container>
      )}
    </PageLayout>
  );
}

import { GraduationCap, Mail, MapPin, Phone } from "lucide-react";
import { useParams } from "react-router-dom";

import { NewsList } from "@/features/news";
import { EventList } from "@/features/events";
import { TeacherGrid } from "@/features/teachers";
import {
  AdmissionSteps,
  Requirements,
  RequiredDocuments,
  TuitionOverview,
} from "@/features/admissions";
import { useCampusBySlug } from "@/features/campuses";
import { ApiError } from "@/shared/api";
import {
  Badge,
  Container,
  EmptyState,
  ErrorState,
  Heading,
  Image,
  Link,
  LoadingState,
  PageLayout,
  Stack,
  Text,
  buttonVariants,
} from "@/shared/design-system/components";
import { cn } from "@/shared/utils/cn";
import { Seo } from "@/shared/seo";

function toTelHref(phone: string): string {
  const localized = "۰۱۲۳۴۵۶۷۸۹";
  const ascii = "0123456789";
  const normalized = phone
    .replace(/[۰-۹]/g, (digit) => ascii[localized.indexOf(digit)])
    .replace(/[^\d+]/g, "");
  return `tel:${normalized}`;
}

/** School visitor path backed by the existing physical Campus resource. */
export function SchoolDetailPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { data, isLoading, isError, error, refetch } = useCampusBySlug(slug);
  const notFound = error instanceof ApiError && error.kind === "not-found";

  return (
    <PageLayout>
      <Seo seo={data?.seo} structuredData={data?.structuredData} />

      {isLoading ? <LoadingState label="در حال بارگذاری اطلاعات مدرسه…" /> : null}

      {isError && notFound ? (
        <Container>
          <Stack gap="sm" align="center" className="py-8">
            <EmptyState
              title="مدرسه یافت نشد"
              description="این مدرسه در حال حاضر در دسترس نیست یا نشانی آن تغییر کرده است."
            />
            <Link href="/schools">بازگشت به فهرست مدارس</Link>
          </Stack>
        </Container>
      ) : null}

      {isError && !notFound ? (
        <ErrorState
          title="دریافت اطلاعات مدرسه ناموفق بود"
          description="لطفاً بعداً دوباره تلاش کنید."
          onRetry={() => void refetch()}
        />
      ) : null}

      {data ? (
        <>
          <Container>
            <Stack gap="lg" className="py-8">
              <Link href="/schools" variant="muted" className="w-fit">
                بازگشت به فهرست مدارس
              </Link>

              {data.featuredImage ? (
                <Image
                  src={data.featuredImage.url}
                  alt={data.featuredImage.altText}
                  ratio={16 / 9}
                  loading="eager"
                />
              ) : null}

              <Stack gap="sm">
                <Heading level={1}>{data.title.fa}</Heading>
                {data.excerpt?.fa ? (
                  <Text variant="lead" color="muted">
                    {data.excerpt.fa}
                  </Text>
                ) : null}
              </Stack>

              {data.gradeLevels?.length ? (
                <Stack gap="sm">
                  <Stack direction="row" gap="xs" align="center">
                    <GraduationCap aria-hidden="true" className="h-5 w-5 text-brand-gold" />
                    <Text as="span" weight="semibold">
                      پایه‌های تحصیلی
                    </Text>
                  </Stack>
                  <Stack direction="row" gap="xs" wrap>
                    {data.gradeLevels.map((grade) => (
                      <Badge key={grade} variant="secondary">
                        {grade}
                      </Badge>
                    ))}
                  </Stack>
                </Stack>
              ) : null}

              <Text variant="body" className="whitespace-pre-line">
                {data.body.fa}
              </Text>

              {(data.address?.fa || data.phone || data.email) ? (
                <Stack gap="sm" className="border-t border-border pt-5">
                  {data.address?.fa ? (
                    <Stack direction="row" gap="sm" align="start">
                      <MapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-brand-gold" />
                      <Text variant="bodySm" color="muted">
                        {data.address.fa}
                      </Text>
                    </Stack>
                  ) : null}
                  {data.phone ? (
                    <Stack direction="row" gap="sm" align="center">
                      <Phone aria-hidden="true" className="h-4 w-4 shrink-0 text-brand-gold" />
                      <Link href={toTelHref(data.phone)} variant="subtle" dir="ltr">
                        {data.phone}
                      </Link>
                    </Stack>
                  ) : null}
                  {data.email ? (
                    <Stack direction="row" gap="sm" align="center">
                      <Mail aria-hidden="true" className="h-4 w-4 shrink-0 text-brand-gold" />
                      <Link href={`mailto:${data.email}`} variant="subtle" dir="ltr">
                        {data.email}
                      </Link>
                    </Stack>
                  ) : null}
                </Stack>
              ) : null}

              <Stack direction="row" gap="sm" wrap className="border-t border-border pt-5">
                <Link
                  href="/admissions"
                  className={cn(buttonVariants({ variant: "default", size: "lg" }))}
                >
                  اطلاعات پذیرش
                </Link>
                <Link
                  href="/contact"
                  className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
                >
                  تماس با گروه آموزشی
                </Link>
              </Stack>
            </Stack>
          </Container>
          <NewsList campusId={data.id} />
          <EventList campusId={data.id} />
          <TeacherGrid campusId={data.id} />
          <Stack gap="none">
            <AdmissionSteps campusId={data.id} />
            <Requirements campusId={data.id} />
            <RequiredDocuments campusId={data.id} />
            <TuitionOverview campusId={data.id} />
          </Stack>
        </>
      ) : null}
    </PageLayout>
  );
}

import { BookOpen, Download } from "lucide-react";
import { useParams } from "react-router-dom";

import { useTextbookBySlug, getTextbookDownloadUrl } from "@/features/textbooks";
import {
  Badge,
  Button,
  Container,
  ErrorState,
  Heading,
  Link,
  LoadingState,
  MediaFrame,
  PageLayout,
  Stack,
  Text,
} from "@/shared/design-system/components";
import { Seo } from "@/shared/seo";

export function TextbookDetailPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const { data, isPending, isError, refetch } = useTextbookBySlug(slug);
  const seo = data
    ? {
        title: data.title.fa,
        description: `${data.subject}، پایه ${data.grade}، ${data.academicYear}`,
        canonicalUrl:
          window.location.origin + "/library/" + encodeURIComponent(data.slug),
        robots: "index, follow",
      }
    : undefined;

  return (
    <PageLayout>
      <Seo seo={seo} />
      {isPending ? (
        <LoadingState label="در حال بارگذاری مشخصات کتاب" />
      ) : isError ? (
        <ErrorState
          title="کتاب یافت نشد"
          description="بارگذاری مشخصات این کتاب با مشکل مواجه شد. لطفاً دوباره تلاش کنید."
          onRetry={() => void refetch()}
        />
      ) : data ? (
        <Container>
          <Stack gap="lg" className="py-8">
            <Link href="/library" variant="subtle" className="w-fit text-brand-navy">
              بازگشت به کتابخانه
            </Link>
            <div className="mx-auto w-full max-w-xl">
              <MediaFrame
                src={null}
                alt={data.title.fa}
                icon={BookOpen}
                label="تصویر جلد موجود نیست"
                ratio={16 / 10}
              />
            </div>
            <Stack gap="sm">
              <Stack direction="row" gap="xs" wrap>
                <Badge variant="secondary">{data.stage}</Badge>
                <Badge variant="outline">پایه {data.grade}</Badge>
              </Stack>
              <Heading level={1}>{data.title.fa}</Heading>
              <Text color="muted">
                {data.subject} · سال تحصیلی {data.academicYear}
              </Text>
            </Stack>
            <dl className="grid gap-4 rounded-xl border border-border bg-card p-5 sm:grid-cols-2">
              <Metadata label="کد کتاب" value={data.code} />
              <Metadata label="رشته" value={data.field} />
              <Metadata label="نوبت چاپ" value={data.edition} />
              <Metadata
                label="تعداد صفحه"
                value={data.pageCount?.toLocaleString("fa-IR")}
              />
            </dl>
            <Stack gap="xs">
              <Text variant="bodySm" color="muted">
                منبع: {data.sourceAttribution}
              </Text>
              {data.licenseNote && (
                <Text variant="bodySm" color="muted">
                  {data.licenseNote}
                </Text>
              )}
            </Stack>
            <Button asChild className="w-fit">
              <a
                href={getTextbookDownloadUrl(data.downloadUrl)}
                target="_blank"
                rel="noreferrer"
              >
                <Download aria-hidden="true" className="ms-2 h-4 w-4" />
                دریافت کتاب
              </a>
            </Button>
          </Stack>
        </Container>
      ) : null}
    </PageLayout>
  );
}

function Metadata({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
}

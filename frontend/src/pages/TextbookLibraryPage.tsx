import { BookOpen, Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  ErrorState,
  Grid,
  Heading,
  Link,
  LoadingState,
  MediaFrame,
  PageLayout,
  Section,
  Stack,
  Text,
} from "@/shared/design-system/components";
import { useTextbooks } from "@/features/textbooks";
import { textbookPath } from "@/app/routes/paths";
import { Seo } from "@/shared/seo";

export function TextbookLibraryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const { data, isPending, isError, refetch } = useTextbooks(query);
  const canonicalOrigin =
    typeof window !== "undefined" ? window.location.origin : "https://example.com";
  const seo = {
    title: "کتابخانه کتاب‌های درسی",
    description: "جست‌وجو و دریافت کتاب‌های درسی مجموعه آموزشی ندای حقیقت.",
    canonicalUrl: canonicalOrigin + "/library",
    robots: "index, follow",
  };

  function updateQuery(value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set("q", value);
    else next.delete("q");
    setSearchParams(next, { replace: true });
  }

  return (
    <>
      <Seo seo={seo} />
      <PageLayout>
        <Section spacing="lg" aria-labelledby="textbook-library-heading">
          <Stack gap="lg">
            <Stack gap="sm" className="text-center">
              <Badge
                variant="secondary"
                className="mx-auto rounded-full bg-brand-gold/15 text-brand-navy"
              >
                کتابخانه عمومی
              </Badge>
              <Heading level={1} id="textbook-library-heading">
                کتابخانه کتاب‌های درسی
              </Heading>
              <Text color="muted">
                کتاب موردنظرتان را بر اساس عنوان، درس یا کد جست‌وجو کنید.
              </Text>
            </Stack>

            <label className="relative mx-auto block w-full max-w-2xl">
              <span className="sr-only">جست‌وجو در کتاب‌ها</span>
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute start-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => updateQuery(event.target.value)}
                placeholder="عنوان، درس یا کد کتاب..."
                className="h-12 w-full rounded-xl border border-input bg-background pe-4 ps-12 text-foreground shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-brand-navy"
                dir="rtl"
              />
            </label>

            {isPending ? (
              <LoadingState label="در حال بارگذاری کتاب‌ها" />
            ) : isError ? (
              <ErrorState
                title="دریافت کتاب‌ها ناموفق بود"
                description="لطفاً دوباره تلاش کنید."
                onRetry={() => void refetch()}
              />
            ) : data?.length ? (
              <Grid cols="3" gap="md">
                {data.map((book) => (
                  <Card
                    key={book.id}
                    variant="elevated"
                    padding="none"
                    className="group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <MediaFrame
                      src={book.coverUrl}
                      alt={book.title.fa}
                      icon={BookOpen}
                      label="تصویر جلد موجود نیست"
                      ratio={16 / 10}
                    />
                    <CardHeader className="gap-3 pb-0">
                      <Stack direction="row" gap="xs" wrap>
                        <Badge variant="secondary">{book.stage}</Badge>
                        <Badge variant="outline">پایه {book.grade}</Badge>
                      </Stack>
                      <CardTitle className="leading-relaxed">{book.title.fa}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <Stack gap="sm">
                        <Text variant="bodySm" color="muted">
                          {book.subject} · {book.academicYear}
                        </Text>
                        <Link
                          href={textbookPath(book.slug)}
                          variant="subtle"
                          className="w-fit text-brand-navy"
                        >
                          مشاهده جزئیات
                        </Link>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Grid>
            ) : (
              <EmptyState
                title="کتابی پیدا نشد"
                description={
                  query
                    ? "عبارت دیگری را جست‌وجو کنید."
                    : "در حال حاضر کتابی برای نمایش وجود ندارد."
                }
              />
            )}
          </Stack>
        </Section>
      </PageLayout>
    </>
  );
}

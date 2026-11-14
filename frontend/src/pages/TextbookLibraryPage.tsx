import { useCallback, useEffect, useState } from "react";
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
import {
  getTextbookCoverUrl,
  useTextbookTaxonomies,
  useTextbooks,
  type PublicTextbookSort,
  type PublicTextbookSortOrder,
} from "@/features/textbooks";
import { textbookPath } from "@/app/routes/paths";
import { Seo } from "@/shared/seo";

function readPage(value: string | null): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function readSort(value: string | null): PublicTextbookSort {
  return value === "title" || value === "year" ? value : "sortOrder";
}

function readOrder(value: string | null): PublicTextbookSortOrder {
  return value === "DESC" ? "DESC" : "ASC";
}

export function TextbookLibraryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const [searchValue, setSearchValue] = useState(query);
  const page = readPage(searchParams.get("page"));
  const sort = readSort(searchParams.get("sort"));
  const order = readOrder(searchParams.get("order"));
  const filters = {
    page,
    q: query,
    stage: searchParams.get("stage") ?? "",
    grade: searchParams.get("grade") ?? "",
    field: searchParams.get("field") ?? "",
    subject: searchParams.get("subject") ?? "",
    year: searchParams.get("year") ?? "",
    sort,
    order,
  };
  const { data, isPending, isError, refetch } = useTextbooks(filters);
  const { data: taxonomies } = useTextbookTaxonomies();
  const canonicalOrigin =
    typeof window !== "undefined" ? window.location.origin : "https://example.com";
  const seo = {
    title: "کتابخانه کتاب‌های درسی",
    description: "جست‌وجو و دریافت کتاب‌های درسی مجموعه آموزشی ندای حقیقت.",
    canonicalUrl: canonicalOrigin + "/library",
    robots: "index, follow",
  };

  const updateParams = useCallback((changes: Record<string, string>, resetPage = false) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    if (resetPage) next.delete("page");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    setSearchValue(query);
  }, [query]);

  useEffect(() => {
    const normalized = searchValue.trim();
    if (normalized === query.trim()) return;

    const timer = window.setTimeout(() => {
      updateParams({ q: normalized }, true);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [query, searchValue, updateParams]);

  useEffect(() => {
    const totalPages = data?.meta.totalPages ?? 0;
    if (totalPages > 0 && page > totalPages) {
      updateParams({ page: String(totalPages) });
    }
  }, [data?.meta.totalPages, page, updateParams]);

  function updateFilter(key: string, value: string) {
    updateParams({ [key]: value }, true);
  }

  function changePage(nextPage: number) {
    updateParams({ page: nextPage > 1 ? String(nextPage) : "" });
  }

  const filterOptions = [
    { key: "stage", label: "مقطع", options: taxonomies?.stage ?? [] },
    { key: "grade", label: "پایه", options: taxonomies?.grade ?? [] },
    { key: "field", label: "رشته", options: taxonomies?.field ?? [] },
    { key: "subject", label: "درس", options: taxonomies?.subject ?? [] },
    { key: "year", label: "سال تحصیلی", options: taxonomies?.year ?? [] },
  ];

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
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="عنوان، درس یا کد کتاب..."
                className="h-12 w-full rounded-xl border border-input bg-background pe-4 ps-12 text-foreground shadow-sm outline-none transition focus-visible:ring-2 focus-visible:ring-brand-navy"
                dir="rtl"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filterOptions.map(({ key, label, options }) => (
                <label key={key} className="grid gap-1.5 text-sm">
                  <span>{label}</span>
                  <select
                    aria-label={label}
                    value={searchParams.get(key) ?? ""}
                    onChange={(event) => updateFilter(key, event.target.value)}
                    className="h-10 rounded-lg border border-input bg-background px-3 text-foreground"
                  >
                    <option value="">همه</option>
                    {options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
              <label className="grid gap-1.5 text-sm">
                <span>مرتب‌سازی</span>
                <select
                  aria-label="مرتب‌سازی"
                  value={`${sort}:${order}`}
                  onChange={(event) => {
                    const [nextSort, nextOrder] = event.target.value.split(":");
                    updateParams(
                      { sort: nextSort, order: nextOrder },
                      true,
                    );
                  }}
                  className="h-10 rounded-lg border border-input bg-background px-3 text-foreground"
                >
                  <option value="sortOrder:ASC">ترتیب پیش‌فرض</option>
                  <option value="title:ASC">عنوان: الف تا ی</option>
                  <option value="title:DESC">عنوان: ی تا الف</option>
                  <option value="year:DESC">سال تحصیلی: جدیدترین</option>
                  <option value="year:ASC">سال تحصیلی: قدیمی‌ترین</option>
                </select>
              </label>
            </div>

            {isPending ? (
              <LoadingState label="در حال بارگذاری کتاب‌ها" />
            ) : isError ? (
              <ErrorState
                title="دریافت کتاب‌ها ناموفق بود"
                description="لطفاً دوباره تلاش کنید."
                onRetry={() => void refetch()}
              />
            ) : data?.items.length ? (
              <>
                <Grid cols="3" gap="md">
                  {data.items.map((book) => (
                    <Card
                      key={book.id}
                      variant="elevated"
                      padding="none"
                      className="group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                    >
                      <MediaFrame
                        src={getTextbookCoverUrl(book.coverUrl)}
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
                <nav
                  aria-label="صفحه‌بندی کتاب‌ها"
                  className="flex items-center justify-center gap-4"
                >
                  <button
                    type="button"
                    aria-label="صفحه قبل"
                    disabled={page <= 1}
                    onClick={() => changePage(page - 1)}
                    className="rounded-lg border border-input px-4 py-2 disabled:opacity-50"
                  >
                    قبلی
                  </button>
                  <Text variant="bodySm" color="muted">
                    صفحه {data.meta.page} از {data.meta.totalPages} · {data.meta.total} کتاب
                  </Text>
                  <button
                    type="button"
                    aria-label="صفحه بعد"
                    disabled={page >= data.meta.totalPages}
                    onClick={() => changePage(page + 1)}
                    className="rounded-lg border border-input px-4 py-2 disabled:opacity-50"
                  >
                    بعدی
                  </button>
                </nav>
              </>
            ) : (
              <EmptyState
                title="کتابی پیدا نشد"
                description={
                  query ||
                  filters.stage ||
                  filters.grade ||
                  filters.field ||
                  filters.subject ||
                  filters.year
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

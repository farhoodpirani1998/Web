import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Grid,
  Heading,
  Section,
  Stack,
  Text,
} from "@/shared/design-system/components";

/**
 * News page "List" section — the news/announcement directory,
 * following the same pattern as `hero`/`features`/`cta`/`about`/
 * `contact`/`schools`.
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Section`, `Stack`, `Grid`, `Card`, `Badge`, `Text`) — no
 * data fetching, no business logic. News entries are grouped into a
 * local array literal rather than interleaved in JSX (Website Frontend
 * Architecture §4, §8), so the eventual swap to a `useNews()`-style
 * data hook is a matter of replacing this literal — the layout and
 * design-system wiring below do not need to change. Real titles/dates/
 * bodies are ultimately the backend's News/Announcements content-module
 * data; this renders frontend-owned Persian placeholder copy in the
 * meantime.
 *
 * There is deliberately no per-article route/link here (§7 — no
 * generic catch-all "render whatever this slug points to" route):
 * individual news-article pages aren't part of this sprint's scope, so
 * cards render as static summaries only, matching what's actually
 * routable today.
 */

const news = [
  {
    id: "n1",
    date: "۱۴۰۴/۰۴/۰۱",
    category: "اطلاعیه",
    title: "آغاز ثبت‌نام دوره‌های نیم‌سال جدید",
    excerpt:
      "متن نمونه درباره زمان‌بندی ثبت‌نام، مدارک مورد نیاز و نحوه انتخاب شعبه برای دوره‌های پیش رو.",
  },
  {
    id: "n2",
    date: "۱۴۰۴/۰۳/۲۰",
    category: "رویداد",
    title: "برگزاری نشست معرفی مسیرهای تحصیلی",
    excerpt:
      "متن نمونه درباره یک نشست حضوری با حضور مشاوران تحصیلی برای آشنایی خانواده‌ها با مسیرهای پیش رو.",
  },
  {
    id: "n3",
    date: "۱۴۰۴/۰۳/۰۵",
    category: "دستاورد",
    title: "کسب رتبه‌های برتر توسط دانش‌آموزان مجموعه",
    excerpt:
      "متن نمونه درباره درخشش گروهی از دانش‌آموزان در آزمون‌های ملی و افتخارآفرینی برای مجموعه.",
  },
  {
    id: "n4",
    date: "۱۴۰۴/۰۲/۱۸",
    category: "اطلاعیه",
    title: "تغییر ساعت کاری شعب در ایام تعطیل",
    excerpt:
      "متن نمونه درباره ساعات کاری ویژه شعب در روزهای تعطیل و نحوه هماهنگی برای مراجعه حضوری.",
  },
  {
    id: "n5",
    date: "۱۴۰۴/۰۲/۰۲",
    category: "رویداد",
    title: "کارگاه آموزشی ویژه اولیا",
    excerpt:
      "متن نمونه درباره برگزاری کارگاهی برای آشنایی اولیا با روش‌های همراهی تحصیلی فرزندان.",
  },
  {
    id: "n6",
    date: "۱۴۰۴/۰۱/۱۵",
    category: "دستاورد",
    title: "افتتاح شعبه جدید در کرج",
    excerpt:
      "متن نمونه درباره افتتاح شعبه‌ای تازه و امکانات آموزشی در نظر گرفته‌شده برای دانش‌آموزان منطقه.",
  },
] as const;

export function NewsList() {
  return (
    <Section spacing="lg" aria-labelledby="news-list-heading">
      <Stack gap="md">
        <Heading id="news-list-heading" level={2}>
          فهرست اخبار
        </Heading>
        <Grid cols="3" gap="md">
          {news.map((item) => (
            <Card key={item.id} variant="outline" padding="md">
              <CardHeader className="p-0">
                <Stack gap="xs">
                  <Stack direction="row" gap="xs" align="center">
                    <Badge variant="secondary">{item.category}</Badge>
                    <Text variant="bodySm" color="muted">
                      {item.date}
                    </Text>
                  </Stack>
                  <CardTitle>{item.title}</CardTitle>
                </Stack>
              </CardHeader>
              <CardContent className="p-0 pt-2">
                <Text variant="bodySm" color="muted">
                  {item.excerpt}
                </Text>
              </CardContent>
            </Card>
          ))}
        </Grid>
      </Stack>
    </Section>
  );
}

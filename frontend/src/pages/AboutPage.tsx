import {
  Avatar,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Grid,
  Heading,
  PageLayout,
  Section,
  Separator,
  Stack,
  Text,
} from "@/shared/design-system/components";

/**
 * Static "About" page (Sprint 3B "Website Pages Foundation").
 *
 * This is a fixed singular page (Website Frontend Architecture §20
 * "Routing Strategy"), not a slug-addressed static page — its route is
 * `/about`, not `/pages/:slug`. A backend-owned Static Pages / About
 * content module is a documented future data source (Product Rules
 * §content modules), but no such endpoint exists on the Public API yet,
 * so per the architecture's working rules this page renders
 * frontend-owned placeholder copy only and fetches nothing.
 *
 * CMS-readiness: every section's copy is grouped into a small local
 * array/object literal (`stats`, `values`, `timeline`, `team`) rather
 * than interleaved directly in JSX. This keeps the eventual swap to a
 * `useAboutPage()`-style data hook a matter of replacing these literals
 * with fetched data — the layout, headings, and design-system wiring
 * below do not need to change. Nothing on this page is fetched or
 * computed today; all content is frontend-owned placeholder copy.
 *
 * Persian-first: copy is authored directly in Persian (the site's
 * Phase 1 locale, §28) rather than as English placeholder text, and the
 * layout relies on logical properties / direction-agnostic design
 * system primitives so it holds up under the app's `dir="rtl"` root
 * (`index.html`) as well as a future `ltr` locale.
 */

const stats = [
  { id: "founded", value: "۱۳۷۸", label: "سال تأسیس" },
  { id: "students", value: "+۱۲٬۰۰۰", label: "دانش‌آموز و دانشجو" },
  { id: "campuses", value: "۶", label: "شعبه فعال" },
  { id: "staff", value: "+۴۰۰", label: "مدرس و کارشناس" },
] as const;

const values = [
  {
    id: "quality",
    title: "کیفیت آموزشی",
    description:
      "طراحی دوره‌ها بر پایه استانداردهای به‌روز آموزشی و بازنگری مستمر محتوا توسط گروه علمی.",
  },
  {
    id: "access",
    title: "دسترسی‌پذیری",
    description:
      "ارائه دوره‌های حضوری و آنلاین در چند شعبه، برای دسترسی آسان‌تر خانواده‌ها و دانش‌آموزان.",
  },
  {
    id: "community",
    title: "جامعه یادگیری",
    description:
      "ایجاد فضایی حمایت‌گر میان دانش‌آموزان، اولیا و مدرسان برای رشد مستمر و مشارکتی.",
  },
  {
    id: "transparency",
    title: "شفافیت",
    description:
      "اطلاع‌رسانی روشن درباره برنامه درسی، هزینه‌ها و پیشرفت تحصیلی به خانواده‌ها.",
  },
] as const;

const timeline = [
  {
    id: "y1378",
    year: "۱۳۷۸",
    title: "آغاز فعالیت",
    description: "شروع کار با یک شعبه و گروهی کوچک از مدرسان داوطلب.",
  },
  {
    id: "y1390",
    year: "۱۳۹۰",
    title: "گسترش شعب",
    description: "راه‌اندازی سومین و چهارمین شعبه در مناطق دیگر شهر.",
  },
  {
    id: "y1398",
    year: "۱۳۹۸",
    title: "ورود به آموزش آنلاین",
    description: "افزودن دوره‌های آنلاین برای پوشش دانش‌آموزان خارج از شهر.",
  },
  {
    id: "y1404",
    year: "۱۴۰۴",
    title: "امروز",
    description: "فعالیت در ۶ شعبه با صدها دوره حضوری و آنلاین در سال.",
  },
] as const;

const team = [
  { id: "p1", name: "نام و نام‌خانوادگی نمونه", role: "مدیر آموزشی" },
  { id: "p2", name: "نام و نام‌خانوادگی نمونه", role: "سرپرست گروه علمی" },
  { id: "p3", name: "نام و نام‌خانوادگی نمونه", role: "مسئول امور دانش‌آموزی" },
] as const;

export function AboutPage() {
  return (
    <PageLayout>
      <Stack gap="none">
        <Section spacing="lg" aria-labelledby="about-hero-heading">
          <Stack gap="sm">
            <Badge variant="secondary" className="w-fit">
              درباره ما
            </Badge>
            <Heading id="about-hero-heading" level={1}>
              با گروه آموزشی ما بیشتر آشنا شوید
            </Heading>
            <Text variant="lead" className="max-w-2xl">
              متنی نمونه برای معرفی کلی مجموعه. این پاراگراف جایگزین خلاصه‌ای
              است که در آینده از طریق سامانه مدیریت محتوا و از سرویس عمومی
              بک‌اند دریافت خواهد شد.
            </Text>
          </Stack>
        </Section>

        <Section spacing="md" tone="muted" className="rounded-lg" aria-labelledby="about-stats-heading">
          <Stack gap="md">
            <Heading id="about-stats-heading" level={2} as="h3">
              مجموعه در یک نگاه
            </Heading>
            <Grid cols="4" gap="md">
              {stats.map((stat) => (
                <Card key={stat.id} variant="outline" padding="md" className="text-center">
                  <Stack gap="xs" align="center">
                    <Text as="span" variant="lead" weight="bold" color="primary">
                      {stat.value}
                    </Text>
                    <Text variant="bodySm" color="muted">
                      {stat.label}
                    </Text>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </Stack>
        </Section>

        <Section spacing="lg" aria-labelledby="about-story-heading">
          <Stack gap="md" className="max-w-3xl">
            <Heading id="about-story-heading" level={2}>
              داستان ما
            </Heading>
            <Text>
              متن نمونه درباره شکل‌گیری مجموعه، انگیزه اولیه بنیان‌گذاران و
              مسیری که تا امروز طی شده است. محتوای واقعی این بخش — شامل
              تاریخچه، مأموریت و رسانه‌های پشتیبان — از طریق سامانه مدیریت
              محتوا نگارش و به‌صورت آماده و ترجمه‌شده ارائه خواهد شد.
            </Text>
            <Text>
              پاراگراف نمونه دوم، تا این بخش از صفحه حجم واقعی‌تری از محتوا
              داشته باشد و بتوان فاصله‌گذاری، طول خطوط و ترتیب خوانش را در هر
              دو جهت متن بررسی کرد.
            </Text>
          </Stack>
        </Section>

        <Section spacing="lg" tone="muted" className="rounded-lg" aria-labelledby="about-values-heading">
          <Stack gap="md">
            <Stack gap="sm">
              <Heading id="about-values-heading" level={2}>
                ارزش‌های ما
              </Heading>
              <Text variant="lead" className="max-w-2xl">
                متن نمونه برای معرفی اصولی که مبنای تصمیم‌گیری و فعالیت روزانه
                مجموعه هستند.
              </Text>
            </Stack>

            <Grid cols="2" gap="md">
              {values.map((value) => (
                <Card key={value.id} variant="outline" padding="md">
                  <CardHeader className="p-0">
                    <CardTitle>{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 pt-2">
                    <Text variant="bodySm" color="muted">
                      {value.description}
                    </Text>
                  </CardContent>
                </Card>
              ))}
            </Grid>
          </Stack>
        </Section>

        <Section spacing="lg" aria-labelledby="about-timeline-heading">
          <Stack gap="md">
            <Heading id="about-timeline-heading" level={2}>
              مسیر رشد
            </Heading>
            <Stack gap="none" as="ol" className="border-s border-border ps-6">
              {timeline.map((item, index) => (
                <Stack
                  key={item.id}
                  as="li"
                  gap="xs"
                  className={index === timeline.length - 1 ? "pb-0 pt-6 first:pt-0" : "pb-6 pt-6 first:pt-0"}
                >
                  <Text as="span" variant="overline" color="primary">
                    {item.year}
                  </Text>
                  <Text as="span" weight="semibold">
                    {item.title}
                  </Text>
                  <Text variant="bodySm" color="muted">
                    {item.description}
                  </Text>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Section>

        <Separator className="my-2" />

        <Section spacing="lg" aria-labelledby="about-team-heading">
          <Stack gap="md">
            <Stack gap="sm">
              <Heading id="about-team-heading" level={2}>
                اعضای تیم
              </Heading>
              <Text variant="lead" className="max-w-2xl">
                متن نمونه برای معرفی گروهی از افرادی که مسئولیت اداره مجموعه
                را بر عهده دارند. اسامی و تصاویر واقعی از طریق سامانه مدیریت
                محتوا تکمیل خواهد شد.
              </Text>
            </Stack>

            <Grid cols="3" gap="md">
              {team.map((member) => (
                <Card key={member.id} variant="outline" padding="md">
                  <Stack direction="row" gap="sm" align="center">
                    <Avatar alt={member.name} fallback={member.name.slice(0, 1)} size="lg" />
                    <Stack gap="none">
                      <Text weight="semibold">{member.name}</Text>
                      <Text variant="bodySm" color="muted">
                        {member.role}
                      </Text>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </Stack>
        </Section>
      </Stack>
    </PageLayout>
  );
}

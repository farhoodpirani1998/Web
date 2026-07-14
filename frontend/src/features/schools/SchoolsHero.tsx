import { Badge, Heading, Section, Stack, Text } from "@/shared/design-system/components";

/**
 * Schools page "Hero" section — first section of the `schools` feature
 * (Website Frontend Architecture §4, §10 "Section Architecture"),
 * following the same pattern as `hero`/`features`/`cta`/`about`/
 * `contact`.
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Section`, `Stack`, `Badge`, `Heading`, `Text`) — no data
 * fetching, no business logic. Real copy is ultimately the backend's
 * Campuses content-module data (§4, §8); this renders frontend-owned
 * Persian placeholder copy in the meantime. Swapping this for a
 * `useSchools()`-style data hook later is additive — `SchoolsPage`
 * only ever composes `<SchoolsHero />`, never its internals.
 *
 * Brand pass: the eyebrow badge and gold underline now match the same
 * treatment `Hero`/`Features`/`CTA`/`StatisticsHero` already use, so
 * this page reads as the same brand system rather than a plainer,
 * disconnected page.
 */
export function SchoolsHero() {
  return (
    <Section spacing="lg" aria-labelledby="schools-hero-heading">
      <Stack gap="sm" align="start">
        <Badge
          variant="outline"
          className="w-fit rounded-full border-brand-gold/40 bg-brand-gold/10 text-brand-navy"
        >
          شعب ما
        </Badge>
        <Stack gap="xs" align="start">
          <Heading id="schools-hero-heading" level={1}>
            شعب گروه آموزشی ما را بشناسید
          </Heading>
          <span aria-hidden="true" className="block h-1 w-16 rounded-full bg-brand-gold" />
        </Stack>
        <Text variant="lead" className="max-w-2xl">
          متنی نمونه درباره پراکندگی جغرافیایی شعب و امکانات هر یک. آدرس،
          تلفن و برنامه دوره‌های هر شعبه در نهایت از طریق سامانه مدیریت
          محتوا و سرویس عمومی بک‌اند دریافت خواهد شد.
        </Text>
      </Stack>
    </Section>
  );
}

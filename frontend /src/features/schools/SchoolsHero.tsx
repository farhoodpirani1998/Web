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
 */
export function SchoolsHero() {
  return (
    <Section spacing="lg" aria-labelledby="schools-hero-heading">
      <Stack gap="sm">
        <Badge variant="secondary" className="w-fit">
          شعب ما
        </Badge>
        <Heading id="schools-hero-heading" level={1}>
          شعب گروه آموزشی ما را بشناسید
        </Heading>
        <Text variant="lead" className="max-w-2xl">
          متنی نمونه درباره پراکندگی جغرافیایی شعب و امکانات هر یک. آدرس،
          تلفن و برنامه دوره‌های هر شعبه در نهایت از طریق سامانه مدیریت
          محتوا و سرویس عمومی بک‌اند دریافت خواهد شد.
        </Text>
      </Stack>
    </Section>
  );
}

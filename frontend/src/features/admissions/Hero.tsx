import { Badge, Heading, Section, Stack, Text } from "@/shared/design-system/components";

/**
 * Admissions page "Hero" section — first section of the `admissions`
 * feature, mirroring `@/features/campuses`'s, `@/features/teachers`'s,
 * and `@/features/events`'s `Hero` sections (themselves following the
 * same pattern as `hero`/`about`/`schools`/`pre-registration`'s `Hero`
 * sections).
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Section`, `Stack`, `Badge`, `Heading`, `Text`) — no data
 * fetching, no business logic. Real copy is ultimately the backend's
 * Admissions content-module data (§4, §8); this renders frontend-owned
 * Persian placeholder copy in the meantime.
 *
 * This feature is deliberately isolated, matching the same "new,
 * isolated feature" scope `@/features/campuses`, `@/features/teachers`,
 * and `@/features/events` were built under — no other feature/page is
 * replaced, renamed, or modified. In particular, `@/features/pre-
 * registration` (route `/pre-registration`) is not touched — this
 * feature only links to it via `AdmissionsCTA`.
 */
export function Hero() {
  return (
    <Section spacing="lg" aria-labelledby="admissions-hero-heading">
      <Stack gap="sm">
        <Badge variant="secondary" className="w-fit">
          پذیرش و ثبت‌نام
        </Badge>
        <Heading id="admissions-hero-heading" level={1}>
          فرآیند پذیرش و ثبت‌نام دانش‌آموزان
        </Heading>
        <Text variant="lead" className="max-w-2xl">
          متنی نمونه درباره فرآیند پذیرش، شرایط لازم، مدارک مورد نیاز و شهریه دوره‌های
          مختلف. جزئیات نهایی هر بخش در نهایت از طریق سامانه مدیریت محتوا و سرویس عمومی
          بک‌اند دریافت خواهد شد.
        </Text>
      </Stack>
    </Section>
  );
}

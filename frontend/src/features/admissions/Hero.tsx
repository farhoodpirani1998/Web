import {
  Badge,
  buttonVariants,
  Heading,
  Link,
  Section,
  Stack,
  Text,
} from "@/shared/design-system/components";
import { cn } from "@/shared/utils/cn";
import { SparkIcon } from "./icons";

/**
 * Admissions page "Hero" section — first section of the `admissions`
 * feature, mirroring `@/features/campuses`'s, `@/features/teachers`'s,
 * and `@/features/events`'s `Hero` sections (themselves following the
 * same pattern as `hero`/`about`/`schools`/`pre-registration`'s `Hero`
 * sections).
 *
 * Presentation only: composed entirely from existing design-system
 * primitives (`Section`, `Stack`, `Badge`, `Heading`, `Text`, `Link`/
 * `buttonVariants`) — no data fetching, no business logic. Real copy is
 * ultimately the backend's Admissions content-module data (§4, §8);
 * this renders frontend-owned Persian placeholder copy in the
 * meantime.
 *
 * This feature is deliberately isolated, matching the same "new,
 * isolated feature" scope `@/features/campuses`, `@/features/teachers`,
 * and `@/features/events` were built under — no other feature/page is
 * replaced, renamed, or modified. In particular, `@/features/pre-
 * registration` (route `/pre-registration`) is not touched — this
 * feature only links to it via a hero CTA and `CTA`.
 *
 * Visual refresh: adopts the same gold-badge/underline eyebrow and
 * soft gradient backdrop already established by `AboutHero`/the
 * homepage `Hero`/`PreRegistrationHero`, plus a CTA pair (primary link
 * to `/pre-registration`, secondary in-page anchor to the tuition
 * section) so the hero funnels visitors the same way `Hero`'s
 * primary/secondary button pair does — both targets already exist
 * (the `/pre-registration` route, this page's own tuition heading), no
 * new route or backend functionality introduced.
 */
export function Hero() {
  return (
    <Section
      spacing="lg"
      aria-labelledby="admissions-hero-heading"
      className="relative isolate overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 rounded-[2.5rem] bg-gradient-to-b from-muted/70 via-muted/15 to-transparent"
      />

      <Stack gap="sm" align="start" className="max-w-2xl">
        <Badge
          variant="outline"
          className="w-fit gap-1.5 rounded-full border-brand-gold/40 bg-brand-gold/10 px-3 py-1 text-brand-navy"
        >
          <SparkIcon className="h-3 w-3" />
          پذیرش و ثبت‌نام
        </Badge>

        <Stack gap="xs" align="start">
          <Heading id="admissions-hero-heading" level={1}>
            فرآیند پذیرش و ثبت‌نام دانش‌آموزان
          </Heading>
          <span aria-hidden="true" className="block h-1 w-16 rounded-full bg-brand-gold" />
        </Stack>

        <Text variant="lead" className="max-w-2xl text-foreground/70">
          متنی نمونه درباره فرآیند پذیرش، شرایط لازم، مدارک مورد نیاز و شهریه دوره‌های
          مختلف. جزئیات نهایی هر بخش در نهایت از طریق سامانه مدیریت محتوا و سرویس عمومی
          بک‌اند دریافت خواهد شد.
        </Text>

        <Stack direction="row" gap="sm" wrap className="pt-2">
          <Link
            href="/pre-registration"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "bg-brand-gold text-brand-navy shadow-sm hover:bg-brand-gold/90",
            )}
          >
            شروع پیش‌ثبت‌نام
          </Link>
          <Link
            href="#admissions-tuition-heading"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "border-brand-navy/25 text-brand-navy hover:bg-brand-navy hover:text-white",
            )}
          >
            مشاهده نمای کلی شهریه
          </Link>
        </Stack>
      </Stack>
    </Section>
  );
}

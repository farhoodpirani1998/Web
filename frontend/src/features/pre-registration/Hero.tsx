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
import { CalendarIcon, CheckIcon, SparkIcon, UsersIcon } from "./icons";

/**
 * Pre-registration page "Hero" section.
 *
 * Follows the same pattern as the homepage's `hero` feature and the
 * other static pages' `*Hero` sections (`AboutHero`, `SchoolsHero`,
 * `NewsHero`, `GalleryHero`): presentation only, composed entirely
 * from existing design-system primitives (`Section`, `Stack`,
 * `Badge`, `Heading`, `Text`, `Link`/`buttonVariants`) — no new
 * components, no data fetching, no business logic. Real headline/intro
 * copy is ultimately Pre-registration content (a CMS-ready section,
 * same category as Hero/Features/CTA content modules, §4, §8); this
 * renders frontend-owned Persian placeholder copy in the meantime. The
 * in-page CTA is a plain anchor link to the `RegistrationForm`
 * section's landmark id — no scroll logic, no client-side state.
 *
 * Visual refresh: adopts the same gold-badge/underline eyebrow
 * treatment and soft gradient backdrop already established by
 * `AboutHero`/the homepage `Hero`, plus a short row of "quick fact"
 * chips (`aria-hidden` icons + existing placeholder-style copy) so the
 * page opens with the same premium navy/gold system as the rest of the
 * site instead of a plain centered text block. Still zero new
 * dependencies — every icon is a local, `aria-hidden` SVG helper
 * (`./icons`, the same technique `Hero`/`ContactInfo` already use).
 */

const quickFacts = [
  { id: "capacity", icon: UsersIcon, label: "ظرفیت محدود هر پایه" },
  { id: "timeline", icon: CalendarIcon, label: "ثبت‌نام کاملاً آنلاین" },
  { id: "review", icon: CheckIcon, label: "بررسی سریع مدارک" },
] as const;

export function Hero() {
  return (
    <Section
      spacing="lg"
      aria-labelledby="pre-registration-hero-heading"
      className="relative isolate overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 rounded-[2.5rem] bg-gradient-to-b from-muted/70 via-muted/15 to-transparent"
      />

      <Stack gap="lg" align="center" className="text-center">
        <Stack gap="sm" align="center">
          <Badge
            variant="outline"
            className="w-fit gap-1.5 rounded-full border-brand-gold/40 bg-brand-gold/10 px-3 py-1 text-brand-navy"
          >
            <SparkIcon className="h-3 w-3" />
            پیش‌ثبت‌نام سال تحصیلی جدید
          </Badge>

          <Stack gap="xs" align="center">
            <Heading id="pre-registration-hero-heading" level={1}>
              پیش‌ثبت‌نام دانش‌آموزان جدید
            </Heading>
            <span aria-hidden="true" className="block h-1 w-16 rounded-full bg-brand-gold" />
          </Stack>

          <Text variant="lead" className="max-w-2xl text-foreground/70">
            متنی نمونه برای معرفی فرآیند پیش‌ثبت‌نام. این پاراگراف جایگزین خلاصه‌ای است که
            در آینده از طریق سامانه مدیریت محتوا و از سرویس عمومی بک‌اند دریافت خواهد شد.
          </Text>
        </Stack>

        <Link
          href="#registration-form"
          className={cn(
            buttonVariants({ variant: "default", size: "lg" }),
            "bg-brand-gold text-brand-navy shadow-sm hover:bg-brand-gold/90",
          )}
        >
          شروع پیش‌ثبت‌نام
        </Link>

        <Stack direction="row" gap="lg" wrap justify="center" className="pt-2">
          {quickFacts.map((fact) => (
            <Stack key={fact.id} direction="row" gap="xs" align="center" className="w-fit">
              <span
                aria-hidden="true"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-navy text-brand-gold"
              >
                <fact.icon className="h-4 w-4" />
              </span>
              <Text as="span" variant="bodySm" color="muted">
                {fact.label}
              </Text>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Section>
  );
}

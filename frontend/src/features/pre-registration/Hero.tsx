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

/**
 * Pre-registration page "Hero" section.
 *
 * Follows the same pattern as the homepage's `hero` feature and the
 * other static pages' `*Hero` sections (`AboutHero`, `SchoolsHero`,
 * `NewsHero`, `GalleryHero`): presentation only, composed entirely
 * from existing design-system primitives (`Section`, `Stack`,
 * `Badge`, `Heading`, `Text`, `Link`/`buttonVariants`) — no new
 * components, no data fetching, no business logic.
 *
 * Real headline/intro copy is ultimately Pre-registration content
 * (a CMS-ready section, same category as Hero/Features/CTA content
 * modules, §4, §8); this renders frontend-owned Persian placeholder
 * copy in the meantime. The in-page CTA is a plain anchor link to the
 * `RegistrationForm` section's landmark id — no scroll logic, no
 * client-side state.
 */
export function Hero() {
  return (
    <Section spacing="lg" aria-labelledby="pre-registration-hero-heading">
      <Stack gap="lg" align="center" className="text-center">
        <Stack gap="sm" align="center">
          <Badge variant="secondary" className="w-fit">
            پیش‌ثبت‌نام سال تحصیلی جدید
          </Badge>
          <Heading id="pre-registration-hero-heading" level={1}>
            پیش‌ثبت‌نام دانش‌آموزان جدید
          </Heading>
          <Text variant="lead" className="max-w-2xl">
            متنی نمونه برای معرفی فرآیند پیش‌ثبت‌نام. این پاراگراف جایگزین خلاصه‌ای است که
            در آینده از طریق سامانه مدیریت محتوا و از سرویس عمومی بک‌اند دریافت خواهد شد.
          </Text>
        </Stack>

        <Link
          href="#registration-form"
          className={cn(buttonVariants({ variant: "default", size: "lg" }))}
        >
          شروع پیش‌ثبت‌نام
        </Link>
      </Stack>
    </Section>
  );
}

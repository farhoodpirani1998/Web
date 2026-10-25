import {
  Container,
  Link,
  SectionHeader,
  Stack,
  buttonVariants,
} from "@/shared/design-system/components";
import { cn } from "@/shared/utils/cn";

/**
 * Admissions page closing CTA — directs visitors to the actual
 * submission flow.
 *
 * Rendered full-bleed *outside* `AdmissionsPage`'s `PageLayout`, the
 * same way the homepage's `@/features/cta` `CTA` is: a `bg-primary`
 * band needs the full viewport width, so it opens its own `Container`
 * instead of inheriting the page gutter.
 *
 * Presentation only. It deliberately does not duplicate
 * `@/features/pre-registration` (route `/pre-registration`) — that
 * feature owns the form; this only links to it.
 */
export function CTA() {
  return (
    <section aria-labelledby="admissions-cta-heading" className="bg-primary">
      <Container size="xl" className="py-16 text-center sm:py-24">
        <SectionHeader
          headingId="admissions-cta-heading"
          headingLevel={2}
          align="center"
          onDark
          eyebrow="به خانواده‌ی ما بپیوندید"
          title="آماده شروع فرآیند ثبت‌نام هستید؟"
          description="فرم پیش‌ثبت‌نام را تکمیل کنید تا مراحل پذیرش را آغاز کنیم."
        />
        <Stack direction="row" gap="sm" wrap justify="center" className="mt-10">
          <Link
            href="/pre-registration"
            className={cn(
              buttonVariants({ size: "lg", shape: "pill" }),
              "bg-brand-gold text-brand-navy shadow-xl shadow-brand-gold/20 hover:bg-brand-gold/90",
            )}
          >
            شروع پیش‌ثبت‌نام
          </Link>
          <Link
            href="/contact"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg", shape: "pill" }),
              "border-white/25 text-white hover:border-brand-gold hover:bg-transparent hover:text-brand-gold",
            )}
          >
            پرسیدن سؤال
          </Link>
        </Stack>
      </Container>
    </section>
  );
}

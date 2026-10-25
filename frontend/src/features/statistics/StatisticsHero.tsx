import { Link, PageHero, buttonVariants } from "@/shared/design-system/components";
import { cn } from "@/shared/utils/cn";

/**
 * Statistics page hero — thin wrapper around the shared `PageHero`.
 * Full-bleed, so `StatisticsPage` renders it outside `PageLayout`.
 *
 * Deliberately no `media` slot: `StatisticsGrid` below carries the
 * numbers, which is the whole point of this page.
 */
export function StatisticsHero() {
  return (
    <PageHero
      headingId="statistics-hero-heading"
      eyebrow="آمار و ارقام"
      title="مجموعه ما در آینه اعداد"
      description="ارقام رسمی مجموعه — شعب، دانش‌آموزان، مدرسان و دستاوردها — پس از انتشار در سامانه مدیریت محتوا در همین صفحه به‌روزرسانی می‌شود."
      actions={
        <>
          <Link
            href="/pre-registration"
            className={cn(
              buttonVariants({ variant: "default", size: "lg", shape: "pill" }),
              "bg-brand-navy text-white shadow-lg shadow-brand-navy/20 hover:bg-brand-navy/90",
            )}
          >
            پیش‌ثبت‌نام
          </Link>
          <Link
            href="/about"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg", shape: "pill" }),
              "border-brand-navy/20 hover:bg-transparent",
            )}
          >
            درباره مجموعه
          </Link>
        </>
      }
    />
  );
}

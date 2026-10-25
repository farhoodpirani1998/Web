import { CalendarRange } from "lucide-react";

import {
  Link,
  MediaFrame,
  PageHero,
  buttonVariants,
} from "@/shared/design-system/components";
import { cn } from "@/shared/utils/cn";

/**
 * Academic Calendar page hero — thin wrapper around the shared
 * `PageHero`. Full-bleed, so `AcademicCalendarPage` renders it outside
 * `PageLayout`.
 *
 * Presentation only: the calendar terms/exams/holidays sections own the
 * date data themselves.
 */
export function Hero() {
  return (
    <PageHero
      headingId="academic-calendar-hero-heading"
      eyebrow="تقویم آموزشی"
      title="تقویم سال تحصیلی"
      description="نیم‌سال‌ها، بازه‌های امتحانی، تعطیلات و تاریخ‌های مهم مجموعه. تاریخ‌های نهایی پس از انتشار در سامانه مدیریت محتوا در همین صفحه به‌روزرسانی می‌شوند."
      media={
        <MediaFrame
          ratio={4 / 3}
          label="تصویر تقویم به‌زودی"
          icon={CalendarRange}
          className="rounded-3xl shadow-xl shadow-brand-navy/5 ring-1 ring-border/60"
        />
      }
      actions={
        <>
          <Link
            href="/pre-registration"
            className={cn(
              buttonVariants({ variant: "default", size: "lg", shape: "pill" }),
              "bg-brand-navy text-white shadow-lg shadow-brand-navy/20 hover:bg-brand-navy/90",
            )}
          >
            ثبت‌نام نیمسال جدید
          </Link>
          <Link
            href="/admissions"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg", shape: "pill" }),
              "border-brand-navy/20 hover:bg-transparent",
            )}
          >
            شرایط پذیرش
          </Link>
        </>
      }
    />
  );
}

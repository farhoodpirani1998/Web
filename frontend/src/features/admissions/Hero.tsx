import { ScrollText } from "lucide-react";

import {
  Link,
  MediaFrame,
  PageHero,
  buttonVariants,
} from "@/shared/design-system/components";
import { cn } from "@/shared/utils/cn";

/**
 * Admissions page hero — thin wrapper around the shared `PageHero`.
 * Full-bleed, so `AdmissionsPage` renders it outside `PageLayout`.
 *
 * Presentation only: admission-step data belongs to `AdmissionSteps`
 * and `Requirements`.
 */
export function Hero() {
  return (
    <PageHero
      headingId="admissions-hero-heading"
      eyebrow="پذیرش و ثبت‌نام"
      title="فرآیند پذیرش و ثبت‌نام دانش‌آموزان"
      description="شرایط لازم، مدارک مورد نیاز و مراحل پذیرش. جزئیات نهایی هر بخش پس از انتشار در سامانه مدیریت محتوا در همین صفحه به‌روزرسانی می‌شود."
      media={
        <MediaFrame
          ratio={4 / 3}
          label="تصویر مراحل پذیرش به‌زودی"
          icon={ScrollText}
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
            شروع پیش‌ثبت‌نام
          </Link>
          <Link
            href="/academic-calendar"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg", shape: "pill" }),
              "border-brand-navy/20 hover:bg-transparent",
            )}
          >
            تقویم آموزشی
          </Link>
        </>
      }
    />
  );
}

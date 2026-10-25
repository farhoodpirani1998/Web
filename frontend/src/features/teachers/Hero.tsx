import { GraduationCap } from "lucide-react";

import {
  Link,
  MediaFrame,
  PageHero,
  buttonVariants,
} from "@/shared/design-system/components";
import { cn } from "@/shared/utils/cn";

/**
 * Teachers page hero — thin wrapper around the shared `PageHero`.
 * Full-bleed, so `TeachersPage` renders it outside `PageLayout`.
 *
 * Presentation only: teacher data belongs to `TeacherGrid`. The media
 * slot stays empty until the Teachers content module publishes real
 * portraits — this page deliberately shows no AI-generated people.
 */
export function Hero() {
  return (
    <PageHero
      headingId="teachers-hero-heading"
      eyebrow="کادر آموزشی"
      title="با مدرسان مجموعه ما آشنا شوید"
      description="سوابق، مدارک تحصیلی و حوزه تدریس هر مدرس پس از انتشار در سامانه مدیریت محتوا در همین صفحه نمایش داده می‌شود."
      media={
        <MediaFrame
          ratio={4 / 3}
          label="تصویر مدرسان به‌زودی"
          icon={GraduationCap}
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

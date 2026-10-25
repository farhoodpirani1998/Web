import { CalendarDays } from "lucide-react";

import {
  Link,
  MediaFrame,
  PageHero,
  buttonVariants,
} from "@/shared/design-system/components";
import { cn } from "@/shared/utils/cn";

/**
 * Events page hero — thin wrapper around the shared `PageHero`.
 * Full-bleed, so `EventsPage` renders it outside `PageLayout`.
 *
 * Presentation only: event data belongs to `EventList`.
 */
export function Hero() {
  return (
    <PageHero
      headingId="events-hero-heading"
      eyebrow="رویدادها"
      title="رویدادها و برنامه‌های مجموعه ما"
      description="زمان، مکان و جزئیات هر رویداد — از کارگاه‌های آموزشی و بازدیدهای علمی تا جشن‌ها — پس از انتشار در سامانه مدیریت محتوا در همین صفحه نمایش داده می‌شود."
      media={
        <MediaFrame
          ratio={4 / 3}
          label="تصویر رویداد به‌زودی"
          icon={CalendarDays}
          className="rounded-3xl shadow-xl shadow-brand-navy/5 ring-1 ring-border/60"
        />
      }
      actions={
        <>
          <Link
            href="/news"
            className={cn(
              buttonVariants({ variant: "default", size: "lg", shape: "pill" }),
              "bg-brand-navy text-white shadow-lg shadow-brand-navy/20 hover:bg-brand-navy/90",
            )}
          >
            اخبار مجموعه
          </Link>
          <Link
            href="/contact"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg", shape: "pill" }),
              "border-brand-navy/20 hover:bg-transparent",
            )}
          >
            تماس با ما
          </Link>
        </>
      }
    />
  );
}

import { MapPin } from "lucide-react";

import {
  Link,
  MediaFrame,
  PageHero,
  buttonVariants,
} from "@/shared/design-system/components";
import { APP_NAME } from "@/shared/config/app";
import { cn } from "@/shared/utils/cn";
import { useSiteSettings } from "@/features/site";

/**
 * Contact page intro — thin feature wrapper around the shared `PageHero`.
 *
 * Site name comes from Site Settings (§8); everything else is
 * frontend-owned chrome. The media slot is where a campus map or access
 * photo lands once the CMS publishes one.
 */
export function ContactIntro() {
  const { data } = useSiteSettings();
  const siteName = data?.siteName.fa ?? APP_NAME;

  return (
    <PageHero
      headingId="contact-intro-heading"
      eyebrow="ارتباط با ما"
      title="تماس با مجموعه"
      description={`برای پرس‌وجوی شرایط پذیرش، هماهنگی بازدید از شعبه یا هر پرسش دیگر با ${siteName} از راه‌های تماس زیر استفاده کنید.`}
      media={
        <MediaFrame
          ratio={4 / 3}
          label="نقشه دسترسی به‌زودی"
          icon={MapPin}
          className="rounded-3xl shadow-xl shadow-brand-navy/5 ring-1 ring-border/60"
        />
      }
      actions={
        <Link
          href="/pre-registration"
          className={cn(
            buttonVariants({ variant: "default", size: "lg", shape: "pill" }),
            "bg-brand-navy text-white shadow-lg shadow-brand-navy/20 hover:bg-brand-navy/90",
          )}
        >
          پیش‌ثبت‌نام
        </Link>
      }
    />
  );
}

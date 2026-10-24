import { ClipboardList } from "lucide-react";

import {
  Link,
  MediaFrame,
  PageHero,
  buttonVariants,
} from "@/shared/design-system/components";
import { cn } from "@/shared/utils/cn";

/**
 * Pre-registration page hero — thin feature wrapper around the shared
 * `PageHero`.
 *
 * The in-page CTA stays a plain anchor to the `RegistrationForm`
 * section's landmark id — no scroll logic, no client-side state.
 */
export function Hero() {
  return (
    <PageHero
      headingId="pre-registration-hero-heading"
      eyebrow="پیش‌ثبت‌نام سال تحصیلی جدید"
      title="ثبت‌نام اولیه دانش‌آموزان"
      description="فرم زیر را تکمیل کنید تا کارشناسان پذیرش برای بررسی ظرفیت شعبه و هماهنگی مراحل بعدی با شما تماس بگیرند."
      media={
        <MediaFrame
          ratio={4 / 3}
          label="تصویر راهنمای ثبت‌نام به‌زودی"
          icon={ClipboardList}
          className="rounded-3xl shadow-xl shadow-brand-navy/5 ring-1 ring-border/60"
        />
      }
      actions={
        <>
          <Link
            href="#registration-form"
            className={cn(
              buttonVariants({ variant: "default", size: "lg", shape: "pill" }),
              "bg-brand-navy text-white shadow-lg shadow-brand-navy/20 hover:bg-brand-navy/90",
            )}
          >
            شروع پیش‌ثبت‌نام
          </Link>
          <Link
            href="#pre-registration-faq-heading"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg", shape: "pill" }),
              "border-brand-navy/20 hover:bg-transparent",
            )}
          >
            پرسش‌های متداول
          </Link>
        </>
      }
    />
  );
}

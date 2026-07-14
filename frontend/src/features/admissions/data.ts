import type { AdmissionStep, Requirement, RequiredDocument, TuitionPlan } from "./types";

/**
 * Frontend-owned placeholder `admissions` records.
 *
 * Grouped into local array literals rather than interleaved in JSX
 * (Website Frontend Architecture §4, §8), mirroring
 * `@/features/campuses`'s and `@/features/teachers`'s `data.ts`, so
 * the eventual swap to a `useAdmissions()`-style data hook is a
 * matter of replacing these literals — no section component needs to
 * change. Real values are ultimately the backend's Admissions
 * content-module data; every entry here is frontend-owned Persian
 * placeholder copy.
 */

export const admissionSteps: readonly AdmissionStep[] = [
  {
    id: "consultation",
    order: "۱",
    title: "مشاوره اولیه",
    description: "متن نمونه درباره هماهنگی جلسه مشاوره اولیه با خانواده و دانش‌آموز.",
  },
  {
    id: "pre-registration",
    order: "۲",
    title: "تکمیل پیش‌ثبت‌نام",
    description: "متن نمونه درباره تکمیل فرم پیش‌ثبت‌نام آنلاین و ارسال اطلاعات اولیه.",
  },
  {
    id: "assessment",
    order: "۳",
    title: "ارزیابی و مصاحبه",
    description: "متن نمونه درباره ارزیابی سطح علمی و مصاحبه حضوری یا آنلاین.",
  },
  {
    id: "documents",
    order: "۴",
    title: "ارائه مدارک",
    description: "متن نمونه درباره ارائه و بررسی مدارک لازم برای تکمیل پرونده.",
  },
  {
    id: "final-registration",
    order: "۵",
    title: "ثبت‌نام قطعی",
    description: "متن نمونه درباره تسویه حساب و تکمیل ثبت‌نام قطعی دانش‌آموز.",
  },
] as const;

export const requirements: readonly Requirement[] = [
  {
    id: "age",
    title: "محدوده سنی",
    description: "متن نمونه درباره حداقل و حداکثر سن پذیرش برای هر مقطع تحصیلی.",
  },
  {
    id: "academic-record",
    title: "سوابق تحصیلی",
    description: "متن نمونه درباره کارنامه و سوابق تحصیلی لازم برای مقاطع بالاتر.",
  },
  {
    id: "residency",
    title: "محدوده جغرافیایی",
    description: "متن نمونه درباره محدوده تحت پوشش هر پردیس برای ثبت‌نام.",
  },
  {
    id: "interview",
    title: "مصاحبه پذیرش",
    description: "متن نمونه درباره الزامی بودن مصاحبه پذیرش برای برخی مقاطع.",
  },
] as const;

export const requiredDocuments: readonly RequiredDocument[] = [
  {
    id: "birth-certificate",
    title: "تصویر شناسنامه",
    description: "متن نمونه درباره تصویر کامل صفحات شناسنامه دانش‌آموز.",
  },
  {
    id: "national-id",
    title: "تصویر کارت ملی",
    description: "متن نمونه درباره تصویر کارت ملی دانش‌آموز یا سرپرست قانونی.",
  },
  {
    id: "last-report-card",
    title: "کارنامه سال قبل",
    description: "متن نمونه درباره کارنامه تحصیلی آخرین سال تحصیلی گذشته.",
  },
  {
    id: "photos",
    title: "عکس پرسنلی",
    description: "متن نمونه درباره تعداد و قطع مورد نیاز عکس پرسنلی.",
  },
  {
    id: "transfer-letter",
    title: "برگه انتقالی",
    description: "متن نمونه درباره برگه انتقالی از مدرسه قبلی، در صورت جابه‌جایی.",
  },
  {
    id: "health-record",
    title: "کارت واکسیناسیون",
    description: "متن نمونه درباره کارت واکسیناسیون یا سوابق سلامت دانش‌آموز.",
  },
] as const;

export const tuitionPlans: readonly TuitionPlan[] = [
  {
    id: "elementary",
    title: "دوره ابتدایی",
    price: "مبلغ نمونه",
    period: "سالانه",
    includes: ["کتاب و جزوه", "بیمه حوادث", "کلاس‌های فوق‌برنامه"],
  },
  {
    id: "middle-school",
    title: "دوره متوسطه اول",
    price: "مبلغ نمونه",
    period: "سالانه",
    includes: ["کتاب و جزوه", "بیمه حوادث", "کارگاه‌های تقویتی"],
  },
  {
    id: "high-school",
    title: "دوره متوسطه دوم",
    price: "مبلغ نمونه",
    period: "سالانه",
    includes: ["کتاب و جزوه", "بیمه حوادث", "دوره‌های آمادگی کنکور"],
  },
] as const;

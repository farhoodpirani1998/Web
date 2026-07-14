import type {
  AcademicTerm,
  AcademicYearStat,
  ExamPeriod,
  Holiday,
  ImportantDate,
} from "./types";

/**
 * Frontend-owned placeholder `academic-calendar` records.
 *
 * Grouped into local array literals rather than interleaved in JSX
 * (Website Frontend Architecture §4, §8), mirroring
 * `@/features/admissions`'s and `@/features/campuses`'s `data.ts`, so
 * the eventual swap to a `useAcademicCalendar()`-style data hook is a
 * matter of replacing these literals — no section component needs to
 * change. Real values are ultimately the backend's Academic Calendar
 * content-module data; every entry here is frontend-owned Persian
 * placeholder copy, not a confirmed date.
 */

export const academicYearStats: readonly AcademicYearStat[] = [
  { id: "start", value: "۱۵ شهریور ۱۴۰۴", label: "آغاز سال تحصیلی" },
  { id: "end", value: "۳۱ خرداد ۱۴۰۵", label: "پایان سال تحصیلی" },
  { id: "terms", value: "۲", label: "تعداد نیم‌سال‌ها" },
  { id: "weeks", value: "۳۷", label: "هفته آموزشی" },
] as const;

export const terms: readonly AcademicTerm[] = [
  {
    id: "first",
    order: "۱",
    title: "نیم‌سال اول",
    dateRange: "۱۵ شهریور تا ۳۰ دی ۱۴۰۴",
    description:
      "متن نمونه درباره محتوای آموزشی، ارزیابی‌های میان‌ترم و فعالیت‌های نیم‌سال اول.",
  },
  {
    id: "second",
    order: "۲",
    title: "نیم‌سال دوم",
    dateRange: "۱ بهمن ۱۴۰۴ تا ۳۱ خرداد ۱۴۰۵",
    description:
      "متن نمونه درباره محتوای آموزشی، ارزیابی‌های میان‌ترم و فعالیت‌های نیم‌سال دوم.",
  },
] as const;

export const holidays: readonly Holiday[] = [
  {
    id: "mehregan",
    name: "تعطیلات مهرگان",
    date: "۱۰ مهر ۱۴۰۴",
    description: "متن نمونه درباره تعطیلی یک‌روزه به مناسبت جشن مهرگان.",
  },
  {
    id: "yalda",
    name: "شب یلدا",
    date: "۳۰ آذر ۱۴۰۴",
    description: "متن نمونه درباره تعطیلی به مناسبت شب یلدا.",
  },
  {
    id: "winter-break",
    name: "تعطیلات زمستانه",
    date: "۲۵ اسفند تا ۱۳ فروردین",
    description: "متن نمونه درباره بازه تعطیلات نوروزی و زمستانه.",
  },
  {
    id: "sizdah-bedar",
    name: "سیزده‌به‌در",
    date: "۱۳ فروردین ۱۴۰۵",
    description: "متن نمونه درباره تعطیلی یک‌روزه به مناسبت سیزده‌به‌در.",
  },
] as const;

export const examPeriods: readonly ExamPeriod[] = [
  {
    id: "midterm-1",
    title: "میان‌ترم نیم‌سال اول",
    dateRange: "۲۰ تا ۲۵ آبان ۱۴۰۴",
    description: "متن نمونه درباره برنامه و مواد امتحانی میان‌ترم نیم‌سال اول.",
  },
  {
    id: "final-1",
    title: "امتحانات پایان نیم‌سال اول",
    dateRange: "۲۰ تا ۳۰ دی ۱۴۰۴",
    description: "متن نمونه درباره برنامه و مواد امتحانی پایان نیم‌سال اول.",
  },
  {
    id: "midterm-2",
    title: "میان‌ترم نیم‌سال دوم",
    dateRange: "۱۵ تا ۲۰ اسفند ۱۴۰۴",
    description: "متن نمونه درباره برنامه و مواد امتحانی میان‌ترم نیم‌سال دوم.",
  },
  {
    id: "final-2",
    title: "امتحانات پایان سال تحصیلی",
    dateRange: "۱۰ تا ۳۱ خرداد ۱۴۰۵",
    description: "متن نمونه درباره برنامه و مواد امتحانی پایان سال تحصیلی.",
  },
] as const;

export const importantDates: readonly ImportantDate[] = [
  {
    id: "registration-open",
    title: "آغاز ثبت‌نام سال تحصیلی جدید",
    date: "۱ مرداد ۱۴۰۴",
    description: "متن نمونه درباره بازگشایی ثبت‌نام برای سال تحصیلی جدید.",
  },
  {
    id: "orientation",
    title: "جلسه آشنایی با اولیا",
    date: "۱۰ شهریور ۱۴۰۴",
    description: "متن نمونه درباره جلسه معارفه و آشنایی اولیا با کادر آموزشی.",
  },
  {
    id: "first-day",
    title: "اولین روز مدرسه",
    date: "۱۵ شهریور ۱۴۰۴",
    description: "متن نمونه درباره آغاز رسمی کلاس‌های سال تحصیلی جدید.",
  },
  {
    id: "parent-teacher",
    title: "جلسات اولیا و مربیان",
    date: "آخر هر ماه",
    description: "متن نمونه درباره برگزاری منظم جلسات اولیا و مربیان.",
  },
  {
    id: "year-end-ceremony",
    title: "جشن پایان سال تحصیلی",
    date: "۳۱ خرداد ۱۴۰۵",
    description: "متن نمونه درباره برگزاری جشن پایان سال تحصیلی و اهدای کارنامه.",
  },
] as const;

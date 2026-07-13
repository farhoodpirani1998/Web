import type { NewsItem } from "./types";

/**
 * Frontend-owned placeholder `NewsItem` records.
 *
 * Grouped into a single local array literal rather than interleaved
 * in JSX (Website Frontend Architecture §4, §8), mirroring
 * `@/features/campuses`'s `data.ts`, `@/features/teachers`'s
 * `data.ts`, and `@/features/gallery`'s `data.ts`, so the eventual
 * swap to a `useNews()`-style data hook is a matter of replacing this
 * one literal — no section component needs to change. Real values are
 * ultimately the backend's News/Announcements content-module data;
 * every entry here is frontend-owned Persian placeholder copy.
 *
 * These are the same six items previously inlined directly inside
 * `NewsList` (same `id`/date/category/title/excerpt, carried over
 * verbatim) plus a new `body` field for `NewsDetails` — extracting
 * them here is a refactor of where the data lives, not a change to
 * what was already shown.
 */
export const newsItems: readonly NewsItem[] = [
  {
    id: "n1",
    date: "۱۴۰۴/۰۴/۰۱",
    category: "اطلاعیه",
    title: "آغاز ثبت‌نام دوره‌های نیم‌سال جدید",
    excerpt:
      "متن نمونه درباره زمان‌بندی ثبت‌نام، مدارک مورد نیاز و نحوه انتخاب شعبه برای دوره‌های پیش رو.",
    body:
      "متن نمونه توضیح تکمیلی درباره زمان‌بندی دقیق ثبت‌نام، مدارک مورد نیاز، شرایط انتخاب شعبه و مراحل تکمیل ثبت‌نام برای دوره‌های نیم‌سال جدید.",
  },
  {
    id: "n2",
    date: "۱۴۰۴/۰۳/۲۰",
    category: "رویداد",
    title: "برگزاری نشست معرفی مسیرهای تحصیلی",
    excerpt:
      "متن نمونه درباره یک نشست حضوری با حضور مشاوران تحصیلی برای آشنایی خانواده‌ها با مسیرهای پیش رو.",
    body:
      "متن نمونه توضیح تکمیلی درباره زمان و مکان برگزاری نشست، سرفصل‌های ارائه‌شده توسط مشاوران تحصیلی و نحوه هماهنگی برای حضور خانواده‌ها.",
  },
  {
    id: "n3",
    date: "۱۴۰۴/۰۳/۰۵",
    category: "دستاورد",
    title: "کسب رتبه‌های برتر توسط دانش‌آموزان مجموعه",
    excerpt:
      "متن نمونه درباره درخشش گروهی از دانش‌آموزان در آزمون‌های ملی و افتخارآفرینی برای مجموعه.",
    body:
      "متن نمونه توضیح تکمیلی درباره آزمون‌های ملی مورد اشاره، تعداد و رتبه دانش‌آموزان درخشان، و برنامه‌های تقدیر از ایشان.",
  },
  {
    id: "n4",
    date: "۱۴۰۴/۰۲/۱۸",
    category: "اطلاعیه",
    title: "تغییر ساعت کاری شعب در ایام تعطیل",
    excerpt:
      "متن نمونه درباره ساعات کاری ویژه شعب در روزهای تعطیل و نحوه هماهنگی برای مراجعه حضوری.",
    body:
      "متن نمونه توضیح تکمیلی درباره بازه دقیق تعطیلات، ساعات کاری ویژه هر شعبه در این بازه، و راه‌های تماس برای هماهنگی مراجعه حضوری.",
  },
  {
    id: "n5",
    date: "۱۴۰۴/۰۲/۰۲",
    category: "رویداد",
    title: "کارگاه آموزشی ویژه اولیا",
    excerpt:
      "متن نمونه درباره برگزاری کارگاهی برای آشنایی اولیا با روش‌های همراهی تحصیلی فرزندان.",
    body:
      "متن نمونه توضیح تکمیلی درباره سرفصل‌های کارگاه، مدرسان حاضر، و نحوه ثبت‌نام اولیای علاقه‌مند به شرکت.",
  },
  {
    id: "n6",
    date: "۱۴۰۴/۰۱/۱۵",
    category: "دستاورد",
    title: "افتتاح شعبه جدید در کرج",
    excerpt:
      "متن نمونه درباره افتتاح شعبه‌ای تازه و امکانات آموزشی در نظر گرفته‌شده برای دانش‌آموزان منطقه.",
    body:
      "متن نمونه توضیح تکمیلی درباره موقعیت شعبه جدید، امکانات آموزشی و رفاهی آن، و ظرفیت پذیرش دانش‌آموزان منطقه کرج.",
  },
] as const;

/**
 * CMS-ready `NewsItem` shape for the `news` feature.
 *
 * This is a frontend-owned type describing the eventual shape of the
 * backend's News/Announcements content-module data (Website Frontend
 * Architecture §4, §8) — no such Public API endpoint exists yet, so
 * nothing here is fetched. Mirrors the same structure as
 * `@/features/campuses`'s `types.ts`, `@/features/teachers`'s
 * `types.ts`, and `@/features/gallery`'s `types.ts`: a title, a
 * category, a date, an excerpt, and a longer body, so
 * `NewsCard`/`NewsList`/`NewsDetails` can be typed against real data
 * later by changing only where `newsItems` (see `./data`) comes from
 * — none of the section components need to change shape.
 */

export interface NewsItem {
  /** Stable identifier, also used as the React list key and the
   *  `NewsDetails` anchor id (`#news-{id}`). */
  id: string;
  title: string;
  /** Short grouping label, e.g. "اطلاعیه", "رویداد", "دستاورد". */
  category: string;
  /** Publish date, Persian calendar formatted (e.g. "۱۴۰۴/۰۴/۰۱"). */
  date: string;
  /** Short summary shown on `NewsCard` (list/overview context). */
  excerpt: string;
  /** Longer copy shown on `NewsDetails` (expanded context). */
  body: string;
}

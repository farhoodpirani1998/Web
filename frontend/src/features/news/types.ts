/**
 * `NewsItem` shape for the `news` feature — the backend's
 * News/Announcements content-module data (Website Frontend
 * Architecture §4, §8), consumed by the feature's data-fetching hook
 * (`./api`, `./useNews`).
 *
 * Mirrors the same structure as `@/features/campuses`'s `types.ts`,
 * `@/features/teachers`'s `types.ts`, and `@/features/gallery`'s
 * `types.ts`: a title, a category, a date, an excerpt, and a longer
 * body, so `NewsCard`/`NewsList`/`NewsDetails`/`HomeNews` stay typed
 * the same way regardless of whether they're rendering live API data
 * or the local placeholder fallback in `./data`.
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
  /** Cover photo asset URL; omitted while no Media module-backed
   *  value exists for the article. */
  imageUrl?: string;
}

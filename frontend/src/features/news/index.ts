/**
 * Public surface of the `news` feature.
 *
 * Per §30/§32 ("features never reach into another feature's
 * internals"), other layers (pages, other features) import these
 * section components only from here — never from the individual
 * `./NewsHero`, `./NewsList`, etc. files directly.
 *
 * `NewsHero` and `NewsList` are the feature's original exports and
 * are unchanged by this extension — every existing import of either
 * keeps working exactly as before. `NewsCard`, `NewsDetails`, `FAQ`,
 * `EmptyState`, and the `NewsItem` type are additive exports,
 * following the same `campuses`/`teachers`/`gallery` feature shape.
 * `EmptyState` is exported for future wiring (see its own file's doc
 * comment) but is not composed by `NewsPage` today.
 */
export { HomeNews } from "./HomeNews";
export { NewsHero } from "./NewsHero";
export { NewsList } from "./NewsList";
export { NewsCard, type NewsCardProps } from "./NewsCard";
export { NewsDetails } from "./NewsDetails";
export { FAQ } from "./FAQ";
export { EmptyState } from "./EmptyState";
export type { NewsItem } from "./types";
export { newsItems } from "./data";
export { fetchNews } from "./api";
export { useNews, newsQueryKey } from "./useNews";

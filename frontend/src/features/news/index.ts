/**
 * Public surface of the `news` feature.
 *
 * Per §30/§32 ("features never reach into another feature's
 * internals"), other layers (pages, other features) import these
 * section components only from here — never from the individual
 * `./NewsHero`, `./NewsList`, etc. files directly.
 *
 * Exports the page sections, API functions, query hooks, and their
 * associated public types.
 */
export { HomeNews } from "./HomeNews";
export { NewsHero } from "./NewsHero";
export { NewsList } from "./NewsList";
export { NewsCard, type NewsCardProps } from "./NewsCard";
export { NewsDetails } from "./NewsDetails";
export { FAQ } from "./FAQ";
export { EmptyState } from "./EmptyState";
export type { NewsItem, PublicNewsDetailDto } from "./types";
export { newsItems } from "./data";
export { fetchNews, fetchNewsBySlug } from "./api";
export { useNews, newsQueryKey } from "./useNews";
export { useNewsBySlug, newsDetailQueryKey } from "./useNewsBySlug";

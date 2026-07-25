import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";

import type { ApiError } from "@/lib/apiError";

import { fetchNewsList } from "../api";
import type { CmsNewsArticle, CmsNewsStatus } from "../types";

/**
 * Fetches the news list (optionally filtered by status and/or
 * category), for `NewsPage`. Same shape as
 * `features/cms/hero-slides/hooks/useHeroSlides` — no cache is needed
 * here the way `media/useMediaById` needs one, since nothing else in
 * this admin resolves a news article by id independently of this list.
 *
 * `setArticles` is exposed (unlike `media/useMediaList`, which only
 * exposes `refetch`) so `NewsPage` can splice a single updated article
 * back into the visible list after a status/schedule change without a
 * full refetch flash — same reasoning as `useFaqs`/`useHeroSlides`,
 * even though News has no drag-reorder to support optimistically.
 */
export interface UseNewsResult {
  articles: CmsNewsArticle[];
  isLoading: boolean;
  error: ApiError | null;
  refetch: () => void;
  setArticles: Dispatch<SetStateAction<CmsNewsArticle[]>>;
}

export function useNews(status?: CmsNewsStatus, category?: string): UseNewsResult {
  const [articles, setArticles] = useState<CmsNewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchNewsList(status, category)
      .then((list) => {
        if (!cancelled) setArticles(list);
      })
      .catch((err) => {
        if (!cancelled) setError(err as ApiError);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [status, category, refetchToken]);

  const refetch = useCallback(() => setRefetchToken((token) => token + 1), []);

  return { articles, isLoading, error, refetch, setArticles };
}

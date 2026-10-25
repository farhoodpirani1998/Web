import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";

import type { ApiError } from "@/lib/apiError";

import { fetchAchievementList } from "../api";
import type { CmsAchievement, CmsAchievementStatus } from "../types";

/**
 * Fetches the achievements list (optionally filtered by status), for
 * `AchievementsPage`. Same shape as `features/cms/faq/hooks/useFaqs`.
 *
 * `setAchievements` is exposed so the page can update the visible order
 * optimistically during drag-reorder — `PATCH /achievements/reorder`
 * returns void, so there's no response body to reconcile against.
 */
export interface UseAchievementsResult {
  achievements: CmsAchievement[];
  isLoading: boolean;
  error: ApiError | null;
  refetch: () => void;
  setAchievements: Dispatch<SetStateAction<CmsAchievement[]>>;
}

export function useAchievements(status?: CmsAchievementStatus): UseAchievementsResult {
  const [achievements, setAchievements] = useState<CmsAchievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchAchievementList(status)
      .then((list) => {
        if (!cancelled) setAchievements(list);
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
  }, [status, refetchToken]);

  const refetch = useCallback(() => setRefetchToken((token) => token + 1), []);

  return { achievements, isLoading, error, refetch, setAchievements };
}

import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";

import type { ApiError } from "@/lib/apiError";

import { fetchFeatureList } from "../api";
import type { CmsFeature, CmsFeatureStatus } from "../types";

/**
 * Fetches the Features list (optionally filtered by status), for
 * `FeaturesPage`. Same shape as `features/cms/faq/hooks/useFaqs`.
 *
 * `setFeatures` is exposed (unlike a plain `refetch`-only hook) because
 * `FeaturesPage` needs to update the visible order optimistically
 * during drag-reorder — `PATCH /features/reorder` returns void, so
 * there's no response body to reconcile the list against, and a full
 * `refetch()` on every drag would be a visible flash for no benefit.
 */
export interface UseFeaturesResult {
  features: CmsFeature[];
  isLoading: boolean;
  error: ApiError | null;
  refetch: () => void;
  setFeatures: Dispatch<SetStateAction<CmsFeature[]>>;
}

export function useFeatures(status?: CmsFeatureStatus): UseFeaturesResult {
  const [features, setFeatures] = useState<CmsFeature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchFeatureList(status)
      .then((list) => {
        if (!cancelled) setFeatures(list);
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

  return { features, isLoading, error, refetch, setFeatures };
}

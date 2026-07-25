import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";

import type { ApiError } from "@/lib/apiError";

import { fetchFaqList } from "../api";
import type { CmsFaq, CmsFaqStatus } from "../types";

/**
 * Fetches the FAQ list (optionally filtered by status), for `FaqPage`.
 * Same shape as `features/cms/media/useMediaList` — no cache is needed
 * here the way `useMediaById` needs one, since nothing else in this
 * admin resolves a FAQ by id independently of this list.
 *
 * `setFaqs` is exposed (unlike `useMediaList`, which only exposes
 * `refetch`) because `FaqPage` needs to update the visible order
 * optimistically during drag-reorder — `PATCH /faqs/reorder` returns
 * void, so there's no response body to reconcile the list against, and
 * a full `refetch()` on every drag would be a visible flash for no
 * benefit.
 */
export interface UseFaqsResult {
  faqs: CmsFaq[];
  isLoading: boolean;
  error: ApiError | null;
  refetch: () => void;
  setFaqs: Dispatch<SetStateAction<CmsFaq[]>>;
}

export function useFaqs(status?: CmsFaqStatus): UseFaqsResult {
  const [faqs, setFaqs] = useState<CmsFaq[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchFaqList(status)
      .then((list) => {
        if (!cancelled) setFaqs(list);
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

  return { faqs, isLoading, error, refetch, setFaqs };
}

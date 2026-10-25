import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";

import type { ApiError } from "@/lib/apiError";

import { fetchAdmissionEntryList } from "../api";
import type { AdmissionEntryKind, CmsAdmissionEntry, CmsAdmissionStatus } from "../types";

/**
 * Fetches the admissions entry list, optionally filtered by status
 * and/or kind. Same shape as `features/cms/faq/hooks/useFaqs`.
 */
export interface UseAdmissionsResult {
  entries: CmsAdmissionEntry[];
  isLoading: boolean;
  error: ApiError | null;
  refetch: () => void;
  setEntries: Dispatch<SetStateAction<CmsAdmissionEntry[]>>;
}

export function useAdmissions(params?: {
  status?: CmsAdmissionStatus;
  kind?: AdmissionEntryKind;
}): UseAdmissionsResult {
  const [entries, setEntries] = useState<CmsAdmissionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

  const status = params?.status;
  const kind = params?.kind;

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchAdmissionEntryList({ status, kind })
      .then((list) => {
        if (!cancelled) setEntries(list);
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
  }, [status, kind, refetchToken]);

  const refetch = useCallback(() => setRefetchToken((token) => token + 1), []);

  return { entries, isLoading, error, refetch, setEntries };
}

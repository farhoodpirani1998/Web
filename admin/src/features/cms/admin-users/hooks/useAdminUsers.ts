import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";

import type { ApiError } from "@/lib/apiError";

import { fetchAdminUserList } from "../api";
import type { CmsAdminUser } from "../types";

/**
 * Fetches the admin roster for the admin-users page. Same shape as the
 * other list hooks (`useFaqs` etc.); `setAdmins` is exposed so the page
 * can reflect a role/active change optimistically without a refetch.
 */
export interface UseAdminUsersResult {
  admins: CmsAdminUser[];
  isLoading: boolean;
  error: ApiError | null;
  refetch: () => void;
  setAdmins: Dispatch<SetStateAction<CmsAdminUser[]>>;
}

export function useAdminUsers(): UseAdminUsersResult {
  const [admins, setAdmins] = useState<CmsAdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchAdminUserList()
      .then((list) => {
        if (!cancelled) setAdmins(list);
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
  }, [refetchToken]);

  const refetch = useCallback(() => setRefetchToken((token) => token + 1), []);

  return { admins, isLoading, error, refetch, setAdmins };
}

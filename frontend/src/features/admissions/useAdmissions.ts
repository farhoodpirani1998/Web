import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { fetchAdmissions, type Admissions } from "./api";

/**
 * TanStack Query key for the Admissions resource.
 */
export const admissionsQueryKey = ["admissions"] as const;

/**
 * Fetches the backend's Admissions content module
 * (`GET /admissions`), grouped into the four lists each section renders.
 * Errors surface as the normalized `ApiError` from `@/shared/api`.
 */
export function useAdmissions(): UseQueryResult<Admissions> {
  return useQuery({
    queryKey: admissionsQueryKey,
    queryFn: fetchAdmissions,
  });
}

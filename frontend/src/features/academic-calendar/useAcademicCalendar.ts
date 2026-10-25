import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { fetchAcademicCalendar, type AcademicCalendar } from "./api";

/**
 * TanStack Query key for the Academic Calendar resource.
 */
export const academicCalendarQueryKey = ["academic-calendar"] as const;

/**
 * Fetches the backend's Academic Calendar content module
 * (`GET /academic-calendar`), grouped into the five lists each section
 * renders. Errors surface as the normalized `ApiError` from
 * `@/shared/api`.
 */
export function useAcademicCalendar(): UseQueryResult<AcademicCalendar> {
  return useQuery({
    queryKey: academicCalendarQueryKey,
    queryFn: fetchAcademicCalendar,
  });
}

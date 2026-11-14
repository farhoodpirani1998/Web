import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { fetchTextbooks, fetchTextbookTaxonomies } from "./api";
import type {
  PublicPaginatedResponse,
  PublicTextbookListItemDto,
  PublicTextbookTaxonomies,
  TextbookListParams,
} from "./types";

export const textbooksQueryKey = ["textbooks"] as const;
export const textbookTaxonomiesQueryKey = ["textbooks", "taxonomies"] as const;

export function useTextbooks(
  filters: TextbookListParams,
): UseQueryResult<PublicPaginatedResponse<PublicTextbookListItemDto>> {
  const normalizedFilters = {
    ...filters,
    q: filters.q?.trim() ?? "",
    page: filters.page ?? 1,
    stage: filters.stage ?? "",
    grade: filters.grade ?? "",
    field: filters.field ?? "",
    subject: filters.subject ?? "",
    year: filters.year ?? "",
    sort: filters.sort ?? "sortOrder",
    order: filters.order ?? "ASC",
  };
  return useQuery({
    queryKey: [...textbooksQueryKey, normalizedFilters],
    queryFn: () => fetchTextbooks(normalizedFilters),
  });
}

export function useTextbookTaxonomies(): UseQueryResult<PublicTextbookTaxonomies> {
  return useQuery({
    queryKey: textbookTaxonomiesQueryKey,
    queryFn: fetchTextbookTaxonomies,
    staleTime: 5 * 60 * 1000,
  });
}

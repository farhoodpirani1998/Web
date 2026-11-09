import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { fetchTextbooks } from "./api";
import type { PublicTextbookListItemDto } from "./types";

export const textbooksQueryKey = ["textbooks"] as const;

export function useTextbooks(query: string): UseQueryResult<PublicTextbookListItemDto[]> {
  const normalizedQuery = query.trim();
  return useQuery({
    queryKey: [...textbooksQueryKey, normalizedQuery],
    queryFn: () => fetchTextbooks(normalizedQuery),
  });
}

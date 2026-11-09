import { useQuery } from "@tanstack/react-query";

import { fetchTextbookTaxonomies, fetchTextbooks } from "../api";

export const textbookKeys = {
  all: ["textbooks"] as const,
  taxonomies: ["textbooks", "taxonomies"] as const,
};

export function useTextbooks() {
  const query = useQuery({ queryKey: textbookKeys.all, queryFn: fetchTextbooks });
  return {
    textbooks: query.data?.items ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useTextbookTaxonomies() {
  const query = useQuery({
    queryKey: textbookKeys.taxonomies,
    queryFn: fetchTextbookTaxonomies,
  });
  return { taxonomies: query.data ?? [], error: query.error };
}

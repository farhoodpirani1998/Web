import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiError } from "@/lib/apiError";
import {
  deleteNewsletterSubscriber,
  fetchNewsletterSubscriberStats,
  fetchNewsletterSubscribers,
} from "../api";
import type {
  NewsletterSubscriber,
  NewsletterSubscriberFilters,
  NewsletterSubscriberStats,
} from "../types";

export const newsletterKeys = {
  all: ["newsletter-subscribers"] as const,
  list: (filters: NewsletterSubscriberFilters) =>
    [...newsletterKeys.all, "list", filters] as const,
  stats: () => [...newsletterKeys.all, "stats"] as const,
};

export function useNewsletterSubscribers(filters: NewsletterSubscriberFilters) {
  const queryClient = useQueryClient();
  const list = useQuery<NewsletterSubscriber[], ApiError>({
    queryKey: newsletterKeys.list(filters),
    queryFn: () => fetchNewsletterSubscribers(filters),
  });
  const stats = useQuery<NewsletterSubscriberStats, ApiError>({
    queryKey: newsletterKeys.stats(),
    queryFn: fetchNewsletterSubscriberStats,
  });
  const remove = useMutation({
    mutationFn: deleteNewsletterSubscriber,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: newsletterKeys.all }),
  });

  return {
    subscribers: list.data ?? [],
    stats: stats.data,
    isLoading: list.isLoading || stats.isLoading,
    error: list.error ?? stats.error,
    remove,
  };
}

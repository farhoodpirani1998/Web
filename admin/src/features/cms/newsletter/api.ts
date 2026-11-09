import { apiClient } from "@/lib/apiClient";
import type {
  NewsletterSubscriber,
  NewsletterSubscriberFilters,
  NewsletterSubscriberStats,
} from "./types";

export async function fetchNewsletterSubscribers(
  filters: NewsletterSubscriberFilters,
): Promise<NewsletterSubscriber[]> {
  const response = await apiClient.get<NewsletterSubscriber[]>("/newsletter-subscribers", {
    params: filters,
  });
  return response.data;
}

export async function fetchNewsletterSubscriberStats(): Promise<NewsletterSubscriberStats> {
  const response = await apiClient.get<NewsletterSubscriberStats>(
    "/newsletter-subscribers/stats",
  );
  return response.data;
}

export async function deleteNewsletterSubscriber(id: string): Promise<void> {
  await apiClient.delete(`/newsletter-subscribers/${id}`);
}

export async function downloadNewsletterCsv(
  filters: NewsletterSubscriberFilters,
): Promise<Blob> {
  const response = await apiClient.get<Blob>("/newsletter-subscribers/export.csv", {
    params: filters,
    responseType: "blob",
  });
  return response.data;
}

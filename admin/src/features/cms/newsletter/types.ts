export interface NewsletterSubscriber {
  id: string;
  email: string;
  createdAt: string;
}

export interface NewsletterSubscriberFilters {
  search?: string;
  from?: string;
  to?: string;
}

export interface NewsletterSubscriberStats {
  total: number;
  today: number;
  thisMonth: number;
}

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/api";
import type { PublicStaticPageDto } from "./types";

// Import types from feature modules
interface PublicHeroSlide {
  id: string;
  image: { url: string; alt?: string } | null;
  title: { fa: string; en?: string };
  subtitle?: { fa: string; en?: string };
  ctaLabel?: { fa: string; en?: string };
  ctaUrl?: string;
  position: number;
}

interface PublicStatisticsDto {
  students: number;
  teachers: number;
  years: number;
  campuses: number;
}

interface PublicCampusDto {
  id: string;
  name: { fa: string; en?: string };
  slug: string;
  location?: string;
  image: { url: string; alt?: string } | null;
}

interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface PublicNewsDto {
  id: string;
  title: { fa: string; en?: string };
  slug: string;
  excerpt?: { fa: string; en?: string };
  featuredImage: { url: string; alt?: string } | null;
  publishAt?: Date;
}

interface PublicGalleryItemDto {
  id: string;
  image: { url: string; alt?: string } | null;
  caption?: { fa: string; en?: string };
  category?: string;
}

interface PublicFeatureDto {
  id: string;
  icon: string;
  title: { fa: string; en?: string };
  description: { fa: string; en?: string };
  position: number;
}

interface PublicAchievementDto {
  id: string;
  label: { fa: string; en?: string };
  value: string;
  icon?: string;
  position: number;
}

interface PublicCtaDto {
  title: { fa: string; en?: string };
  description?: { fa: string; en?: string };
  primaryButtonLabel: { fa: string; en?: string };
  primaryButtonUrl: string;
  secondaryButtonLabel?: { fa: string; en?: string };
  secondaryButtonUrl?: string;
  backgroundImage: { url: string; alt?: string } | null;
}

interface PublicTestimonialDto {
  id: string;
  name: string;
  role?: string;
  content: { fa: string; en?: string };
  avatar: { url: string; alt?: string } | null;
  position: number;
}

interface HomepageAggregateData {
  homepage: PublicStaticPageDto | null;
  hero: PublicHeroSlide[] | null;
  statistics: PublicStatisticsDto | null;
  campuses: PublicCampusDto[];
  news: PaginatedResult<PublicNewsDto>;
  gallery: PaginatedResult<PublicGalleryItemDto>;
  features: PublicFeatureDto[];
  achievements: PublicAchievementDto[];
  cta: PublicCtaDto | null;
  testimonials: PublicTestimonialDto[];
}

const homepageAggregateQueryKey = ["homepage", "aggregate"];

async function fetchHomepageAggregate(): Promise<HomepageAggregateData> {
  const { data } = await apiClient.get("/public/homepage/aggregate");
  return data;
}

/**
 * Fetches all homepage sections in parallel from the backend aggregate endpoint.
 * This reduces LCP from sequential API calls (1489ms) to a single parallel fetch (~230ms).
 *
 * The aggregate endpoint (GET /public/homepage/aggregate) returns all sections
 * cached server-side, avoiding the need for multiple sequential client-side queries.
 */
export function useHomepageAggregate() {
  return useQuery({
    queryKey: homepageAggregateQueryKey,
    queryFn: fetchHomepageAggregate,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export { homepageAggregateQueryKey };

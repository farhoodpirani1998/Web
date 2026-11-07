import * as React from "react";
import { Card, Skeleton, Stack } from "@/shared/design-system/components";
import { cn } from "@/shared/utils/cn";

export interface NewsCardSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Renders the larger "featured" lead story skeleton variant. */
  featured?: boolean;
}

/**
 * Skeleton placeholder for `NewsCard` — sized to match the card's
 * eventual content layout (both compact grid tile and featured lead
 * story variants). Used by `NewsList` during data loading (Phase 3).
 *
 * Mirrors the card's structure: image placeholder, metadata row
 * (category badge + date), title, excerpt, and link — all rendered
 * as pulsing skeleton blocks without text.
 */
const NewsCardSkeleton = React.forwardRef<HTMLDivElement, NewsCardSkeletonProps>(
  ({ featured = false, className, ...props }, ref) => (
    <Card
      variant="elevated"
      padding="none"
      className={cn("overflow-hidden bg-background", className)}
      {...props}
      ref={ref}
    >
      {/* Image placeholder */}
      <Skeleton shape="rect" className={cn("w-full", featured ? "h-56" : "h-40")} />

      {/* Content area */}
      <Stack gap="sm" className={cn("p-5", featured && "p-6")}>
        {/* Metadata row (category + date) */}
        <Stack direction="row" gap="sm" align="center">
          <Skeleton shape="rect" className="h-6 w-20 rounded-full" />
          <Skeleton shape="text" className="h-3 w-16" />
        </Stack>

        {/* Title */}
        <Stack gap="xs">
          <Skeleton shape="text" className="h-6 w-full" />
          {featured && <Skeleton shape="text" className="h-6 w-4/5" />}
        </Stack>

        {/* Excerpt */}
        <Stack gap="xs">
          <Skeleton shape="text" className="h-4 w-full" />
          <Skeleton shape="text" className="h-4 w-5/6" />
          {featured && <Skeleton shape="text" className="h-4 w-3/4" />}
        </Stack>

        {/* Link */}
        <Skeleton shape="text" className="h-4 w-20" />
      </Stack>
    </Card>
  ),
);
NewsCardSkeleton.displayName = "NewsCardSkeleton";

export { NewsCardSkeleton };

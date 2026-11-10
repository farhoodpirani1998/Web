import * as React from "react";
import { Card, Skeleton } from "@/shared/design-system/components";
import { cn } from "@/shared/utils/cn";

export type GalleryCardSkeletonProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Skeleton placeholder for `GalleryCard` — sized to match the card's
 * square aspect-ratio tile layout. Used by `GalleryGrid` during data
 * loading.
 *
 * A simple square skeleton matching the gallery's uniform grid layout.
 */
const GalleryCardSkeleton = React.forwardRef<HTMLDivElement, GalleryCardSkeletonProps>(
  ({ className, ...props }, ref) => (
    <Card
      variant="elevated"
      padding="none"
      className={cn("overflow-hidden bg-background", className)}
      {...props}
      ref={ref}
    >
      {/* Square image placeholder (aspect-square) */}
      <Skeleton shape="rect" className="aspect-square w-full" />
    </Card>
  ),
);
GalleryCardSkeleton.displayName = "GalleryCardSkeleton";

export { GalleryCardSkeleton };

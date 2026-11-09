import * as React from "react";
import { Card, Skeleton, Stack } from "@/shared/design-system/components";
import { cn } from "@/shared/utils/cn";

export type EventCardSkeletonProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Skeleton placeholder for `EventCard` — sized to match the card's
 * eventual layout with image/placeholder, category badge, title,
 * description, tags, and event details (date/time/location). Used by
 * `EventList` during data loading (Phase 3).
 *
 * Mirrors the card's structure: image area, category badge overlay,
 * title, description, tags row, details section, and link.
 */
const EventCardSkeleton = React.forwardRef<HTMLDivElement, EventCardSkeletonProps>(
  ({ className, ...props }, ref) => (
    <Card
      variant="elevated"
      padding="none"
      className={cn("overflow-hidden bg-background", className)}
      {...props}
      ref={ref}
    >
      {/* Image placeholder */}
      <div className="relative">
        <Skeleton shape="rect" className="h-48 w-full" />

        {/* Category badge overlay placeholder */}
        <div className="absolute start-3 top-3">
          <Skeleton shape="rect" className="h-6 w-20 rounded" />
        </div>
      </div>

      {/* Content area */}
      <Stack gap="sm" className="p-4">
        {/* Title */}
        <Stack gap="xs">
          <Skeleton shape="text" className="h-6 w-full" />
          <Skeleton shape="text" className="h-6 w-3/4" />
        </Stack>

        {/* Description */}
        <Stack gap="xs">
          <Skeleton shape="text" className="h-4 w-full" />
          <Skeleton shape="text" className="h-4 w-5/6" />
        </Stack>

        {/* Tags row */}
        <Stack direction="row" gap="xs" wrap>
          <Skeleton shape="rect" className="h-6 w-16 rounded-full" />
          <Skeleton shape="rect" className="h-6 w-20 rounded-full" />
        </Stack>

        {/* Details section (date/time/location) */}
        <div className="border-t border-border pt-3">
          <Stack gap="xs">
            {/* Date/time row */}
            <Stack direction="row" gap="xs" align="center">
              <Skeleton shape="circle" className="h-4 w-4 shrink-0" />
              <Skeleton shape="text" className="h-4 w-32" />
            </Stack>

            {/* Location row */}
            <Stack direction="row" gap="xs" align="start">
              <Skeleton shape="circle" className="mt-0.5 h-4 w-4 shrink-0" />
              <Skeleton shape="text" className="h-4 w-28" />
            </Stack>
          </Stack>
        </div>

        {/* Link placeholder */}
        <Skeleton shape="text" className="h-4 w-20" />
      </Stack>
    </Card>
  ),
);
EventCardSkeleton.displayName = "EventCardSkeleton";

export { EventCardSkeleton };

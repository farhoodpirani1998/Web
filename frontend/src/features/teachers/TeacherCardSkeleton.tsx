import * as React from "react";
import { Card, Skeleton, Stack } from "@/shared/design-system/components";
import { cn } from "@/shared/utils/cn";

export type TeacherCardSkeletonProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Skeleton placeholder for `TeacherCard` — sized to match the card's
 * eventual portrait-card layout with avatar, name, subject, bio,
 * specialties, and link. Used by `TeacherGrid` during data loading
 * data loading.
 *
 * Mirrors the card's structure: gradient header with avatar ring,
 * name/subject text, bio excerpt, specialty badges, and detail link.
 */
const TeacherCardSkeleton = React.forwardRef<HTMLDivElement, TeacherCardSkeletonProps>(
  ({ className, ...props }, ref) => (
    <Card
      variant="elevated"
      padding="none"
      className={cn("overflow-hidden bg-background", className)}
      {...props}
      ref={ref}
    >
      {/* Gradient header with avatar placeholder */}
      <Stack
        align="center"
        gap="sm"
        className="bg-gradient-to-b from-brand-navy/10 via-muted/40 to-transparent px-6 pb-5 pt-8"
      >
        {/* Avatar ring + placeholder */}
        <div className="rounded-full p-1 ring-2 ring-brand-gold/40">
          <Skeleton shape="circle" className="h-20 w-20" />
        </div>

        {/* Name placeholder */}
        <Skeleton shape="text" className="h-5 w-32" />

        {/* Subject badge placeholder */}
        <Skeleton shape="rect" className="h-6 w-24 rounded-full" />
      </Stack>

      {/* Content area */}
      <Stack gap="sm" className="p-4">
        {/* Bio text */}
        <Stack gap="xs">
          <Skeleton shape="text" className="h-4 w-full" />
          <Skeleton shape="text" className="h-4 w-5/6" />
        </Stack>

        {/* Specialties badges row */}
        <Stack direction="row" gap="xs" wrap justify="center">
          <Skeleton shape="rect" className="h-6 w-16 rounded-full" />
          <Skeleton shape="rect" className="h-6 w-20 rounded-full" />
          <Skeleton shape="rect" className="h-6 w-18 rounded-full" />
        </Stack>

        {/* Link placeholder */}
        <Skeleton shape="text" className="h-4 w-20 self-center" />
      </Stack>
    </Card>
  ),
);
TeacherCardSkeleton.displayName = "TeacherCardSkeleton";

export { TeacherCardSkeleton };

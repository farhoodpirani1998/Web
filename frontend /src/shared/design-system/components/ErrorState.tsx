import * as React from "react";

import { Button } from "@/shared/design-system/components/ui/button";
import { Heading } from "@/shared/design-system/components/Heading";
import { Stack } from "@/shared/design-system/components/Stack";
import { Text } from "@/shared/design-system/components/Text";
import { cn } from "@/shared/utils/cn";

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  /** Label + handler for a retry affordance. Omit if there's nothing to retry. */
  onRetry?: () => void;
  retryLabel?: string;
}

/**
 * Content-agnostic error-boundary-adjacent primitive (§12, §13, §18),
 * for *data*-level failures (a failed query, a failed fetch) rather
 * than render-time crashes — those are `ErrorBoundary`'s job. Composed
 * from the same Sprint 2A primitives as `EmptyState`, with `role="alert"`
 * so assistive technology announces it as soon as it mounts.
 */
const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  (
    {
      icon,
      title = "Something went wrong",
      description = "We couldn't load this content. Please try again.",
      onRetry,
      retryLabel = "Try again",
      className,
      ...props
    },
    ref,
  ) => (
    <Stack
      ref={ref}
      role="alert"
      align="center"
      justify="center"
      gap="sm"
      className={cn("px-6 py-12 text-center", className)}
      {...props}
    >
      {icon && (
        <div className="text-destructive" aria-hidden="true">
          {icon}
        </div>
      )}
      <Heading level={3} align="center">
        {title}
      </Heading>
      {description && (
        <Text variant="bodySm" color="muted" align="center" className="max-w-md">
          {description}
        </Text>
      )}
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="mt-2">
          {retryLabel}
        </Button>
      )}
    </Stack>
  ),
);
ErrorState.displayName = "ErrorState";

export { ErrorState };

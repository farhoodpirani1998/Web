import * as React from "react";

import { Spinner, type SpinnerProps } from "@/shared/design-system/components/Spinner";
import { Stack } from "@/shared/design-system/components/Stack";
import { Text } from "@/shared/design-system/components/Text";
import { cn } from "@/shared/utils/cn";

export interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visible caption under the spinner. Also used as the spinner's a11y label. */
  label?: string;
  size?: SpinnerProps["size"];
}

/**
 * Content-agnostic loading-region primitive (§12, §13, §19). A thin,
 * centered composition of `Spinner` for the common "content area is
 * fetching" case — `PageLoader` remains the route-level equivalent;
 * this is for a feature to use inside its own section/card.
 */
const LoadingState = React.forwardRef<HTMLDivElement, LoadingStateProps>(
  ({ label = "Loading", size = "lg", className, ...props }, ref) => (
    <Stack
      ref={ref}
      align="center"
      justify="center"
      gap="sm"
      className={cn("px-6 py-12", className)}
      {...props}
    >
      <Spinner size={size} label={label} />
      {label && (
        <Text variant="bodySm" color="muted" aria-hidden="true">
          {label}
        </Text>
      )}
    </Stack>
  ),
);
LoadingState.displayName = "LoadingState";

export { LoadingState };
